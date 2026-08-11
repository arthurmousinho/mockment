import { ConflictError, NotFoundError } from "../../common/http-error.ts";
import type { PaginationInput } from "../../common/pagination.schema.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";
import { env } from "../../config/env.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type {
  CheckoutCompletionStatus,
  GenerateCheckoutLinkInput,
} from "../schemas/checkout.schema.ts";
import { paymentService } from "./payment.service.ts";
import { subscriptionService } from "./subscription.service.ts";

function buildCheckoutLink(checkoutId: string) {
  return `${env.WEB_URL}/checkout/${checkoutId}`;
}

async function generateLink(input: GenerateCheckoutLinkInput) {
  const payment = await paymentService.findById(input.paymentId);
  if (payment.status !== "CREATED") {
    throw new Error("Only payment in CREATED state can be checked out.");
  }

  const defaultSuccessLink = `${env.WEB_URL}/success-checkout`;
  const defaultCancelLink = `${env.WEB_URL}/cancel-checkout`;

  const checkout = await prismaSingleton.checkout.create({
    data: {
      apiKeyId: input.apiKeyId,
      paymentId: input.paymentId,
      successUrl: input.successUrl ?? defaultSuccessLink,
      cancelUrl: input.cancelUrl ?? defaultCancelLink,
      subscriptionId: input.subscriptionId ?? null,
    },
  });

  return buildCheckoutLink(checkout.id);
}

async function getGeneratedLinkByPaymentId(paymentId: string) {
  const checkout = await prismaSingleton.checkout.findFirst({
    where: { paymentId },
  });
  return checkout ? buildCheckoutLink(checkout.id) : null;
}

async function findAll(paginationInput: PaginationInput) {
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const [endpoint, total] = await Promise.all([
    prismaSingleton.checkout.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.checkout.count(),
  ]);
  return buildPaginatedResponse({
    data: endpoint,
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
  const checkout = await findById(id);
  const payment = await paymentService.findById(checkout.paymentId);

  if (payment.status !== "CREATED") {
    throw new ConflictError(
      `Payment with ID ${checkout.paymentId} is not in a valid state for completion. Payment status must be "CREATED" but is "${payment.status}".`,
    );
  }

  switch (status) {
    case "APPROVED":
      await paymentService.changeStatus(checkout.paymentId, "PROCESSING");
      await paymentService.changeStatus(checkout.paymentId, "APPROVED");
      if (checkout.subscriptionId) {
        await subscriptionService.activate(checkout.subscriptionId);
      }
      break;
    case "DECLINED":
      await paymentService.changeStatus(checkout.paymentId, "DECLINED");
      break;
    case "CANCELED":
      await paymentService.changeStatus(checkout.paymentId, "CANCELED");
      break;
  }
}

export const checkoutService = {
  generateLink,
  getGeneratedLinkByPaymentId,
  findAll,
  getDetails,
  complete,
};
