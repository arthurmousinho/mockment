import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../common/http-error.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
  createPrefixedId,
} from "../../common/utils.ts";
import { env } from "../../config/env.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type {
  CheckoutListInput,
  CreateCheckoutInput,
  CompleteCheckoutInput,
} from "../schemas/checkout.schema.ts";
import { paymentService } from "./payment.service.ts";
import { subscriptionService } from "./subscription.service.ts";
import { buildCheckoutSearchFilter } from "../filters/checkout.filters.ts";
import { customerService } from "./customer.service.ts";
import { eventService } from "./event.service.ts";

export function buildCheckoutLink(checkoutId: string) {
  return `${env.WEB_URL}/checkout/${checkoutId}`;
}

export async function create(input: CreateCheckoutInput) {
  if (input.customerId) {
    await customerService.findById(input.customerId);
  }

  if (input.subscriptionId) {
    await subscriptionService.findById(input.subscriptionId);
  }

  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  if (expiresAt && expiresAt <= new Date()) {
    throw new UnprocessableEntityError(
      "The expiration date must be in the future.",
    );
  }

  const opennedCheckout = await prismaSingleton.checkout.create({
    data: {
      id: createPrefixedId("chk"),
      amountInCents: input.amountInCents,
      currency: input.currency,
      allowedMethods: input.allowedMethods,
      customerId: input.customerId ?? null,
      subscriptionId: input.subscriptionId ?? null,
      successUrl: input.successUrl ?? `${env.WEB_URL}/success-checkout`,
      cancelUrl: input.cancelUrl ?? `${env.WEB_URL}/cancel-checkout`,
      expiresAt,
    },
  });

  await eventService.emit({
    resourceId: opennedCheckout.id,
    type: "CHECKOUT_CREATED",
  });

  return {
    ...opennedCheckout,
    link: buildCheckoutLink(opennedCheckout.id),
  };
}

async function getGeneratedCheckoutByPaymentId(paymentId: string) {
  const checkout = await prismaSingleton.checkout.findUnique({
    where: { paymentId },
  });
  return {
    checkoutId: checkout?.id ?? null,
    checkoutLink: checkout ? buildCheckoutLink(checkout.id) : null,
  };
}

async function findAll(paginationInput: CheckoutListInput) {
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const where = buildCheckoutSearchFilter(paginationInput.search);
  const [checkouts, total] = await Promise.all([
    prismaSingleton.checkout.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.checkout.count({ where }),
  ]);

  return buildPaginatedResponse({
    data: checkouts.map((item) => {
      return { ...item, link: buildCheckoutLink(item.id) };
    }),
    page: paginationInput.page,
    limit: paginationInput.limit,
    total,
  });
}

async function getDetails(id: string) {
  const checkout = await prismaSingleton.checkout.findUnique({
    where: { id },
    include: { payment: true, subscription: true },
  });

  if (!checkout) {
    throw new NotFoundError(`Checkout with ID ${id} was not found.`);
  }

  return checkout;
}

async function findById(id: string) {
  const checkout = await prismaSingleton.checkout.findUnique({
    where: { id },
  });

  if (!checkout) {
    throw new NotFoundError(`Checkout with ID ${id} was not found.`);
  }

  return checkout;
}

async function complete(id: string, input: CompleteCheckoutInput) {
  const checkout = await findById(id);

  if (checkout.status !== "OPEN") {
    throw new UnprocessableEntityError(`Checkout with ID ${id} is not open.`);
  }

  if (checkout.expiresAt && new Date(checkout.expiresAt) <= new Date()) {
    await prismaSingleton.checkout.update({
      where: { id: checkout.id },
      data: { status: "EXPIRED" },
    });
    throw new UnprocessableEntityError(`Checkout with ID ${id} has expired.`);
  }

  if (
    !Array.isArray(checkout.allowedMethods) ||
    !checkout.allowedMethods.includes(input.method)
  ) {
    throw new UnprocessableEntityError(
      `Payment method ${input.method} is not allowed for checkout ${id}.`,
    );
  }

  if (checkout.subscriptionId) {
    await subscriptionService.activate(checkout.subscriptionId);
  }

  const createdPayment = await paymentService.create({
    amountInCents: checkout.amountInCents,
    method: input.method,
    currency: checkout.currency,
    customerId: checkout.customerId ?? undefined,
  });

  await paymentService.changeStatus(createdPayment.id, "PROCESSING");
  await paymentService.changeStatus(createdPayment.id, "APPROVED");

  const completedCheckout = await prismaSingleton.checkout.update({
    where: { id: checkout.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      paymentId: createdPayment.id,
    },
  });

  await eventService.emit({
    resourceId: checkout.id,
    type: "CHECKOUT_COMPLETED",
  });

  return completedCheckout;
}

export const checkoutService = {
  create,
  getGeneratedCheckoutByPaymentId,
  findAll,
  getDetails,
  complete,
};
