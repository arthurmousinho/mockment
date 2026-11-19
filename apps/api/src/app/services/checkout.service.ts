import {
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
import { virtualClockService } from "./virtual-clock.service.ts";

export function buildCheckoutLink(checkoutId: string) {
  return `${env.WEB_URL}/checkout/${checkoutId}`;
}

export async function create(input: CreateCheckoutInput) {
  const isSubscriptionCheckout = "subscriptionId" in input;

  const subscription = isSubscriptionCheckout
    ? await subscriptionService.findById(input.subscriptionId)
    : null;

  if (subscription?.status !== undefined && subscription.status !== "PENDING") {
    throw new UnprocessableEntityError(
      "Only PENDING subscriptions can have a checkout.",
    );
  }

  if (!isSubscriptionCheckout && input.customerId) {
    await customerService.findById(input.customerId);
  }

  const now = await virtualClockService.now();
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

  if (expiresAt && expiresAt <= now) {
    throw new UnprocessableEntityError(
      "The expiration date must be in the future.",
    );
  }

  const checkout = await prismaSingleton.checkout.create({
    data: {
      id: createPrefixedId("chk"),
      amountInCents: isSubscriptionCheckout
        ? subscription!.amountInCents
        : input.amountInCents,
      currency: isSubscriptionCheckout
        ? subscription!.currency
        : input.currency,
      allowedMethods: isSubscriptionCheckout
        ? [subscription!.method]
        : input.allowedMethods,
      customerId: isSubscriptionCheckout
        ? subscription!.customerId
        : (input.customerId ?? null),
      subscriptionId: subscription?.id ?? null,
      successUrl: input.successUrl ?? `${env.WEB_URL}/success-checkout`,
      cancelUrl: input.cancelUrl ?? `${env.WEB_URL}/cancel-checkout`,
      expiresAt,
    },
  });

  await eventService.emit({
    resourceId: checkout.id,
    type: "CHECKOUT_CREATED",
    payload: checkout,
  });

  return {
    ...checkout,
    link: buildCheckoutLink(checkout.id),
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

async function getSession(id: string) {
  const checkout = await prismaSingleton.checkout.findUnique({
    where: { id },
    include: { subscription: true },
  });

  if (!checkout) {
    throw new NotFoundError(`Checkout with ID ${id} was not found.`);
  }

  if (checkout.status !== "OPEN") {
    throw new UnprocessableEntityError(`Checkout with ID ${id} is not open.`);
  }

  const now = await virtualClockService.now();
  if (checkout.expiresAt && checkout.expiresAt <= now) {
    await expire(id);
    throw new UnprocessableEntityError(`Checkout with ID ${id} has expired.`);
  }

  return checkout;
}

async function getDetails(id: string) {
  const checkout = await prismaSingleton.checkout.findUnique({
    where: { id },
  });

  if (!checkout) {
    throw new NotFoundError(`Checkout with ID ${id} was not found.`);
  }

  const events = await eventService.findAllByResourceId(checkout.id);

  return { ...checkout, events };
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

async function cancel(id: string) {
  const checkout = await findById(id);

  if (checkout.status !== "OPEN") {
    throw new UnprocessableEntityError(`Checkout with ID ${id} is not open.`);
  }

  const canceledCheckout = await prismaSingleton.checkout.update({
    where: { id: checkout.id },
    data: { status: "CANCELED" },
  });

  await eventService.emit({
    resourceId: canceledCheckout.id,
    type: "CHECKOUT_CANCELED",
    payload: canceledCheckout,
  });

  return canceledCheckout;
}

async function expire(id: string) {
  const expiredCheckout = await prismaSingleton.checkout.update({
    where: { id },
    data: { status: "EXPIRED" },
  });

  await eventService.emit({
    resourceId: expiredCheckout.id,
    type: "CHECKOUT_EXPIRED",
    payload: expiredCheckout,
  });

  return expiredCheckout;
}

async function complete(id: string, input: CompleteCheckoutInput) {
  const checkout = await findById(id);

  if (checkout.status !== "OPEN") {
    throw new UnprocessableEntityError(`Checkout with ID ${id} is not open.`);
  }

  const now = await virtualClockService.now();
  if (checkout.expiresAt && new Date(checkout.expiresAt) <= now) {
    await expire(id);
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

  const createdPayment = await paymentService.create({
    amountInCents: checkout.amountInCents,
    method: input.method,
    currency: checkout.currency,
    customerId: checkout.customerId ?? undefined,
  });

  await paymentService.changeStatus(createdPayment.id, "PROCESSING");
  await paymentService.changeStatus(createdPayment.id, input.outcome);

  // FIXME: This doesn't ensure atomicity, becouse the activation can fail.
  if (input.outcome === "APPROVED" && checkout.subscriptionId) {
    await subscriptionService.activate(checkout.subscriptionId);
  }

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
    payload: completedCheckout,
  });

  return completedCheckout;
}

export const checkoutService = {
  create,
  getGeneratedCheckoutByPaymentId,
  findAll,
  getSession,
  getDetails,
  cancel,
  complete,
};
