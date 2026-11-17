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
  CheckoutCompletionStatus,
  GenerateCheckoutLinkInput,
  CreateCheckoutInput,
} from "../schemas/checkout.schema.ts";
import { paymentService } from "./payment.service.ts";
import { subscriptionService } from "./subscription.service.ts";
import { buildCheckoutSearchFilter } from "../filters/checkout.filters.ts";
import { customerService } from "./customer.service.ts";
import { apiKeyService } from "./api-key.service.ts";
import { eventService } from "./event.service.ts";

export function buildCheckoutLink(checkoutId: string) {
  return `${env.WEB_URL}/checkout/${checkoutId}`;
}

export async function create(apiKey: string, input: CreateCheckoutInput) {
  const validatedApiKey = await apiKeyService.validate(apiKey);

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
      apiKeyId: validatedApiKey.id,
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

async function complete(id: string, status: CheckoutCompletionStatus) {
  return;

  // const checkout = await findById(id);
  // const payment = await paymentService.findById(checkout.paymentId);

  // if (payment.status !== "CREATED") {
  //   throw new ConflictError(
  //     `Payment with ID ${checkout.paymentId} is not in a valid state for completion. Payment status must be "CREATED" but is "${payment.status}".`,
  //   );
  // }

  // switch (status) {
  //   case "APPROVED":
  //     await paymentService.changeStatus(checkout.paymentId, "PROCESSING");
  //     await paymentService.changeStatus(checkout.paymentId, "APPROVED");
  //     if (checkout.subscriptionId) {
  //       await subscriptionService.activate(checkout.subscriptionId);
  //     }
  //     break;
  //   case "DECLINED":
  //     await paymentService.changeStatus(checkout.paymentId, "PROCESSING");
  //     await paymentService.changeStatus(checkout.paymentId, "DECLINED");
  //     break;
  //   case "CANCELED":
  //     await paymentService.changeStatus(checkout.paymentId, "CANCELED");
  //     break;
  // }

  // return checkout;
}

export const checkoutService = {
  create,
  getGeneratedCheckoutByPaymentId,
  findAll,
  getDetails,
  complete,
};
