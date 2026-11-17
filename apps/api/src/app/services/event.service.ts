import { buildEventSearchFilter } from "../filters/event.filters.ts";
import { NotFoundError } from "../../common/http-error.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
  createPrefixedId,
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
      id: createPrefixedId("evt"),
      type: input.type,
      resourceId: input.resourceId ?? null,
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

async function findById(id: string) {
  const event = await prismaSingleton.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new NotFoundError(`Event with ID ${id} was not found.`);
  }

  return event;
}

async function findAllByResourceId(resourceId: string) {
  return await prismaSingleton.event.findMany({
    where: { resourceId },
    select: { id: true, type: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

async function replay(id: string) {
  const event = await findById(id);
  await webhookDeliveryService.dispatch(event);
  return event;
}

export const eventService = {
  emit,
  findAll,
  findById,
  findAllByResourceId,
  replay,
};
