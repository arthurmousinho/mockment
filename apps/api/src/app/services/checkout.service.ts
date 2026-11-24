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
  CreateStandaloneCheckoutInput,
  CreateSubscriptionCheckoutInput,
  CreateProductsCheckoutInput,
  CompleteCheckoutInput,
} from "../schemas/checkout.schema.ts";
import { paymentService } from "./payment.service.ts";
import { subscriptionService } from "./subscription.service.ts";
import { buildCheckoutSearchFilter } from "../filters/checkout.filters.ts";
import { customerService } from "./customer.service.ts";
import { eventService } from "./event.service.ts";
import { virtualClockService } from "./virtual-clock.service.ts";
import { productService } from "./product.service.ts";

export function buildCheckoutLink(checkoutId: string) {
  return `${env.WEB_URL}/checkout/${checkoutId}`;
}

async function prepareSubscriptionCheckout(
  input: CreateSubscriptionCheckoutInput,
) {
  const subscription = await subscriptionService.findById(input.subscriptionId);

  if (subscription.status !== "PENDING") {
    throw new UnprocessableEntityError(
      "Only PENDING subscriptions can have a checkout.",
    );
  }

  return {
    amountInCents: subscription.amountInCents,
    currency: subscription.currency,
    allowedMethods: [subscription.method],
    customerId: subscription.customerId,
    subscriptionId: subscription.id,
  };
}

async function prepareStandaloneCheckout(input: CreateStandaloneCheckoutInput) {
  if (input.customerId) {
    await customerService.findById(input.customerId);
  }
  return {
    amountInCents: input.amountInCents,
    currency: input.currency,
    allowedMethods: input.allowedMethods,
    customerId: input.customerId ?? null,
    subscriptionId: null,
  };
}

async function prepareProductsCheckout(input: CreateProductsCheckoutInput) {
  if (input.customerId) {
    await customerService.findById(input.customerId);
  }

  const products = await productService.findByIds(
    input.products.map((item) => item.productId),
  );

  const currency = products[0]!.currency;
  const hasProductWithDifferentCurrency = products.some(
    (product) => product.currency !== currency || !product.enabled,
  );

  if (hasProductWithDifferentCurrency) {
    throw new UnprocessableEntityError(
      "Products must be enabled and use the same currency.",
    );
  }

  const totalAmountInCents = products.reduce(
    (total, product, index) =>
      total + product.priceInCents * input.products[index]!.quantity,
    0,
  );

  if (
    !Number.isSafeInteger(totalAmountInCents) ||
    totalAmountInCents <= 0 ||
    totalAmountInCents > 2147483647
  ) {
    throw new UnprocessableEntityError(
      "The product total must be greater than zero and fit in a 32-bit integer.",
    );
  }

  return {
    amountInCents: totalAmountInCents,
    currency,
    allowedMethods: input.allowedMethods,
    customerId: input.customerId ?? null,
    subscriptionId: null,
    items: {
      create: products.map((product, index) => ({
        id: createPrefixedId("cki"),
        productId: product.id,
        quantity: input.products[index]!.quantity,
        unitAmountInCents: product.priceInCents,
      })),
    },
  };
}

export async function create(input: CreateCheckoutInput) {
  let checkoutData;

  const isSubscriptionCheckout = "subscriptionId" in input;
  const isProductCheckout = "products" in input;

  if (isSubscriptionCheckout) {
    checkoutData = await prepareSubscriptionCheckout(input);
  } else if (isProductCheckout) {
    checkoutData = await prepareProductsCheckout(input);
  } else {
    checkoutData = await prepareStandaloneCheckout(input);
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
      ...checkoutData,
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
    include: { subscription: true, items: true },
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
    include: { items: true },
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

async function expireDueCheckouts(now: Date) {
  const dueCheckouts = await prismaSingleton.checkout.findMany({
    where: {
      status: "OPEN",
      expiresAt: { lte: now },
    },
  });

  if (dueCheckouts.length === 0) {
    return { expiredCheckoutsCount: 0 };
  }

  const result = await prismaSingleton.checkout.updateMany({
    where: {
      id: {
        in: dueCheckouts.map((checkout) => checkout.id),
      },
      status: "OPEN",
      expiresAt: { lte: now },
    },
    data: {
      status: "EXPIRED",
    },
  });

  await Promise.all(
    dueCheckouts.map((checkout) =>
      eventService.emit({
        type: "CHECKOUT_EXPIRED",
        resourceId: checkout.id,
        payload: {
          ...checkout,
          status: "EXPIRED",
        },
      }),
    ),
  );

  return {
    expiredCheckoutsCount: result.count,
  };
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
  expireDueCheckouts,
  findAll,
  getSession,
  getDetails,
  cancel,
  complete,
};
