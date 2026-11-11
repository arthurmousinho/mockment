import type { Subscription } from "../../../generated/prisma/browser.ts";
import type { PaymentStatus } from "../../../generated/prisma/enums.ts";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../common/http-error.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
  createPrefixedId,
} from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type {
  CreatePaymentInput,
  PaymentListInput,
} from "../schemas/payment.schema.ts";
import { customerService } from "./customer.service.ts";
import { apiKeyService } from "./api-key.service.ts";
import { buildCheckoutLink, checkoutService } from "./checkout.service.ts";
import { eventService } from "./event.service.ts";
import { buildPaymentSearchFilter } from "../filters/payment.filters.ts";

async function create(
  apiKey: string,
  input: CreatePaymentInput,
  subscriptionId?: string,
) {
  const validatedApiKey = await apiKeyService.validate(apiKey);

  if (input.idempotencyKey) {
    const paymentWithIdempotencyKey = await prismaSingleton.payment.findUnique({
      where: {
        apiKeyId_idempotencyKey: {
          apiKeyId: validatedApiKey.id,
          idempotencyKey: input.idempotencyKey,
        },
      },
    });

    if (paymentWithIdempotencyKey) {
      const checkout = await checkoutService.getGeneratedCheckoutByPaymentId(
        paymentWithIdempotencyKey.id,
      );
      return { ...paymentWithIdempotencyKey, ...checkout };
    }
  }

  if (input.externalId) {
    const paymentWithExternalId = await prismaSingleton.payment.findUnique({
      where: {
        apiKeyId_externalId: {
          externalId: input.externalId,
          apiKeyId: validatedApiKey.id,
        },
      },
    });

    if (paymentWithExternalId) {
      throw new ConflictError(
        `Payment with external ID ${input.externalId} already created.`,
      );
    }
  }

  if (input.customerId) {
    await customerService.findById(input.customerId);
  }

  const payment = await prismaSingleton.payment.create({
    data: {
      id: createPrefixedId("pay"),
      amountInCents: input.amountInCents,
      currency: input.currency,
      method: input.method,
      idempotencyKey: input.idempotencyKey ?? null,
      externalId: input.externalId ?? null,
      description: input.description ?? null,
      apiKeyId: validatedApiKey.id,
      customerId: input.customerId ?? null,
      status: "CREATED",
    },
  });

  const checkout = await checkoutService.generateLink({
    apiKeyId: validatedApiKey.id,
    paymentId: payment.id,
    ...(input.successUrl && { successUrl: input.successUrl }),
    ...(input.cancelUrl && { cancelUrl: input.cancelUrl }),
    ...(subscriptionId && { subscriptionId }),
  });

  const paymentPayload = { ...payment, ...checkout };

  await eventService.emit({
    paymentId: payment.id,
    type: "PAYMENT_CREATED",
    payload: paymentPayload,
  });

  return paymentPayload;
}

async function findAll(input: PaymentListInput) {
  const { skip, take } = buildPrismaPaginationParams(input);
  const where = buildPaymentSearchFilter(input.search);
  const [payments, total] = await Promise.all([
    prismaSingleton.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.payment.count({ where }),
  ]);
  return buildPaginatedResponse({
    data: payments,
    page: input.page,
    limit: input.limit,
    total,
  });
}

async function getMetrics() {
  const payments = await prismaSingleton.payment.groupBy({
    by: ["status"],
    _sum: { amountInCents: true },
    _count: { _all: true },
  });

  const totalTransactions = payments.reduce(
    (total, group) => total + group._count._all,
    0,
  );
  const totalPaymentVolume = payments.reduce(
    (total, group) => total + (group._sum.amountInCents ?? 0),
    0,
  );
  const approved = payments.find((group) => group.status === "APPROVED");
  const approvedVolume = approved?._sum.amountInCents ?? 0;
  const approvedCount = approved?._count._all ?? 0;

  return {
    totalPaymentVolume,
    approvedVolume,
    approvalRate: totalTransactions
      ? (approvedCount / totalTransactions) * 100
      : 0,
    totalTransactions,
    averageTicket: approvedCount ? approvedVolume / approvedCount : 0,
    refundedVolume:
      payments.find((group) => group.status === "REFUNDED")?._sum
        .amountInCents ?? 0,
  };
}

async function findById(id: string) {
  const payment = await prismaSingleton.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    throw new NotFoundError(`Payment with ID ${id} was not found.`);
  }

  return payment;
}

async function getDetails(id: string) {
  const payment = await prismaSingleton.payment.findUnique({
    where: { id },
    include: {
      checkout: { select: { id: true } },
      events: {
        select: {
          id: true,
          type: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError(`Payment with ID ${id} was not found.`);
  }

  const { checkout, ...paymentDetails } = payment;

  return {
    ...paymentDetails,
    checkoutId: checkout?.id ?? null,
    checkoutLink: checkout ? buildCheckoutLink(checkout.id) : null,
  };
}

function validateStatusTransition(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus,
) {
  const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    CREATED: ["PROCESSING", "CANCELED"],
    PROCESSING: ["APPROVED", "DECLINED"],
    APPROVED: ["CANCELED", "REFUNDED"],
    DECLINED: [],
    CANCELED: [],
    REFUNDED: [],
  };
  const allowed = validTransitions[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot change payment status from ${currentStatus} to ${newStatus}.`,
    );
  }
}

async function changeStatus(id: string, newStatus: PaymentStatus) {
  const payment = await findById(id);
  validateStatusTransition(payment.status, newStatus);

  const updatedPayment = await prismaSingleton.payment.update({
    where: { id: payment.id },
    data: { status: newStatus },
  });

  await eventService.emit({
    paymentId: payment.id,
    type: `PAYMENT_${newStatus}`,
    payload: updatedPayment,
  });

  return updatedPayment;
}

async function createRecurringPayment(subscription: Subscription) {
  const payment = await prismaSingleton.payment.create({
    data: {
      id: createPrefixedId("pay"),
      amountInCents: subscription.amountInCents,
      currency: subscription.currency,
      method: subscription.method,
      description: subscription.description,
      apiKeyId: subscription.apiKeyId,
      customerId: subscription.customerId,
      status: "CREATED",
    },
  });

  await eventService.emit({
    paymentId: payment.id,
    type: "PAYMENT_CREATED",
    payload: payment,
  });

  return payment;
}

export const paymentService = {
  create,
  findAll,
  getMetrics,
  findById,
  changeStatus,
  getDetails,
  createRecurringPayment,
};
