import { prismaSingleton } from "../../config/prisma.ts";
import { webhookDeliveryService } from "./webhook-delivery.service.ts";
import type { PaymentEventType } from "../../../generated/prisma/client.ts";
import type { PaginationInput } from "../../common/pagination.schema.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";

async function save(input: {
  type: PaymentEventType;
  paymentId: string;
  payload?: unknown;
}) {
  const event = await prismaSingleton.paymentEvent.create({
    data: {
      type: input.type,
      paymentId: input.paymentId,
      payload: input.payload ?? {},
    },
  });
  await webhookDeliveryService.dispatch(event);
  return event;
}

async function findAll(paginationInput: PaginationInput) {
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const [paymentEvents, total] = await Promise.all([
    prismaSingleton.paymentEvent.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.paymentEvent.count(),
  ]);
  return buildPaginatedResponse({
    data: paymentEvents,
    page: paginationInput.page,
    limit: paginationInput.limit,
    total,
  });
}

export const paymentEventService = {
  save,
  findAll,
};
