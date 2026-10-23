import { buildEventSearchFilter } from "../filters/event.filters.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import { webhookDeliveryService } from "./webhook-delivery.service.ts";
import type {
  EmitEventInput,
  EventListInput,
} from "../schemas/event.schema.ts";

async function emit(input: EmitEventInput) {
  const event = await prismaSingleton.event.create({
    data: {
      type: input.type,
      paymentId: input.paymentId ?? null,
      subscriptionId: input.subscriptionId ?? null,
      payload: input.payload,
    },
  });
  await webhookDeliveryService.dispatch(event);
  return event;
}

async function findAll(input: EventListInput) {
  const { skip, take } = buildPrismaPaginationParams(input);
  const where = buildEventSearchFilter(input.search);
  const [events, total] = await Promise.all([
    prismaSingleton.event.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.event.count({ where }),
  ]);
  return buildPaginatedResponse({
    data: events,
    page: input.page,
    limit: input.limit,
    total,
  });
}

export const eventService = {
  emit,
  findAll,
};
