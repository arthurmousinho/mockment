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
import { apiKeyService } from "./api-key.service.ts";
import { checkoutService } from "./checkout.service.ts";
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
      const checkoutLink = await checkoutService.getGeneratedLinkByPaymentId(
        paymentWithIdempotencyKey.id,
      );
      return { ...paymentWithIdempotencyKey, checkoutLink };
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
      status: "CREATED",
    },
  });

  const checkoutLink = await checkoutService.generateLink({
    apiKeyId: validatedApiKey.id,
    paymentId: payment.id,
    ...(input.successUrl && { successUrl: input.successUrl }),
    ...(input.cancelUrl && { cancelUrl: input.cancelUrl }),
    ...(subscriptionId && { subscriptionId }),
  });

  const paymentPayload = { ...payment, checkoutLink };

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

  return payment;
}

function validateStatusTransition(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus,
) {
  const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    CREATED: ["PROCESSING", "CANCELED"],
    PROCESSING: ["APPROVED", "DECLINED"],
    APPROVED: ["CANCELED"],
    DECLINED: [],
    CANCELED: [],
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
    payload: payment,
  });

  return updatedPayment;
}

async function createRecurringPayment(subscription: Subscription) {
  const payment = await prismaSingleton.payment.create({
    data: {
      amountInCents: subscription.amountInCents,
      currency: subscription.currency,
      method: subscription.method,
      description: subscription.description,
      apiKeyId: subscription.apiKeyId,
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
  findById,
  changeStatus,
  getDetails,
  createRecurringPayment,
};
