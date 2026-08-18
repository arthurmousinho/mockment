import type { PaginationInput } from "../../common/pagination.schema.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type { EmitEventInput } from "../schemas/event.schema.ts";

async function emit(input: EmitEventInput) {
  const event = await prismaSingleton.event.create({
    data: {
      type: input.type,
      paymentId: input.paymentId ?? null,
      subscriptionId: input.subscriptionId ?? null,
      payload: input.payload,
    },
  });
  //await webhookDeliveryService.dispatch(event);
  return event;
}

async function findAll(paginationInput: PaginationInput) {
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const [events, total] = await Promise.all([
    prismaSingleton.event.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.event.count(),
  ]);
  return buildPaginatedResponse({
    data: events,
    page: paginationInput.page,
    limit: paginationInput.limit,
    total,
  });
}

export const eventService = {
  emit,
  findAll,
};
