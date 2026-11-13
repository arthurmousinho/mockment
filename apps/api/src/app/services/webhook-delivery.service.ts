import { createHmac } from "node:crypto";
import { BadRequestError, NotFoundError } from "../../common/http-error.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type {
  Event,
  EventType,
  WebhookEndpoint,
} from "../../../generated/prisma/client.ts";
import { webhookEndpointService } from "./webhook-endpoint.service.ts";
import type { PaginationInput } from "../../common/pagination.schema.ts";
import type { WebhookDeliveryListInput } from "../schemas/webhook.schema.ts";
import { WebhookDeliveryStatus } from "../../../generated/prisma/enums.ts";
import { buildWebhookDeliverySearchFilter } from "../filters/webhook-delivery.filters.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
  createPrefixedId,
} from "../../common/utils.ts";

const WEBHOOK_REQUEST_TIMEOUT_MS = 10_000;

async function getMetrics() {
  const now = new Date();
  const minuteMs = 60_000;
  const start = Math.floor(now.getTime() / minuteMs) * minuteMs - 9 * minuteMs;
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const [statuses, recentDeliveries, deliveredToday] = await Promise.all([
    prismaSingleton.webhookDelivery.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prismaSingleton.webhookDelivery.findMany({
      where: { createdAt: { gte: new Date(start), lte: now } },
      select: { createdAt: true, status: true },
    }),
    prismaSingleton.webhookDelivery.count({
      where: { status: "SUCCESS", deliveredAt: { gte: startOfDay, lte: now } },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    Object.values(WebhookDeliveryStatus).map((status) => [
      status,
      statuses.find((group) => group.status === status)?._count._all ?? 0,
    ]),
  ) as Record<WebhookDeliveryStatus, number>;
  const totalDeliveries = statuses.reduce(
    (total, group) => total + group._count._all,
    0,
  );
  const minuteReport = Array.from({ length: 10 }, (_, index) => ({
    minute: new Date(start + index * minuteMs).toISOString(),
    ...(Object.fromEntries(
      Object.values(WebhookDeliveryStatus).map((status) => [status, 0]),
    ) as Record<WebhookDeliveryStatus, number>),
  }));

  for (const delivery of recentDeliveries) {
    const index = Math.floor((delivery.createdAt.getTime() - start) / minuteMs);
    minuteReport[index]![delivery.status]++;
  }

  return {
    requestedAt: now.toISOString(),
    totalDeliveries,
    deliveredToday,
    successRate: totalDeliveries
      ? (countByStatus.SUCCESS / totalDeliveries) * 100
      : 0,
    countByStatus,
    minuteReport,
  };
}

async function findAll(paginationInput: WebhookDeliveryListInput) {
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const where = buildWebhookDeliverySearchFilter(paginationInput.search);
  const [deliveries, total] = await Promise.all([
    prismaSingleton.webhookDelivery.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        endpoint: { select: { url: true } },
      },
    }),
    prismaSingleton.webhookDelivery.count({ where }),
  ]);
  return buildPaginatedResponse({
    data: deliveries,
    page: paginationInput.page,
    limit: paginationInput.limit,
    total,
  });
}

async function findAllByEndpointId(
  endpointId: string,
  paginationInput: PaginationInput,
) {
  await webhookEndpointService.findById(endpointId);
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const [deliveries, total] = await Promise.all([
    prismaSingleton.webhookDelivery.findMany({
      where: { endpointId },
      orderBy: { deliveredAt: "desc" },
      skip,
      take,
    }),
    prismaSingleton.webhookDelivery.count({
      where: { endpointId },
    }),
  ]);
  return buildPaginatedResponse({
    data: deliveries,
    page: paginationInput.page,
    limit: paginationInput.limit,
    total,
  });
}

async function send(endpoint: WebhookEndpoint, event: Event) {
  if (!endpoint.enabled) {
    throw new BadRequestError("Webhook endpoint is disabled.");
  }

  const delivery = await prismaSingleton.webhookDelivery.create({
    data: {
      id: createPrefixedId("wdel"),
      endpointId: endpoint.id,
      eventId: event.id,
      status: "PENDING",
    },
  });

  const body = JSON.stringify({
    id: event.id,
    type: event.type,
    createdAt: event.createdAt,
    data: event.payload,
  });

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": webhookEndpointService.createSignature(
          endpoint.secret,
          body,
        ),
      },
      body: body,
      signal: AbortSignal.timeout(WEBHOOK_REQUEST_TIMEOUT_MS),
    });

    return await prismaSingleton.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: response.ok ? "SUCCESS" : "FAILED",
        statusCode: response.status,
        deliveredAt: new Date(),
        error: response.ok
          ? null
          : `Request returned status ${response.status}`,
      },
    });
  } catch (err) {
    return await prismaSingleton.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "FAILED",
        deliveredAt: new Date(),
        error:
          err instanceof Error && err.name === "TimeoutError"
            ? `Webhook request timed out after ${WEBHOOK_REQUEST_TIMEOUT_MS} ms.`
            : err instanceof Error
              ? err.message
              : "Unknown error",
      },
    });
  }
}

async function retry(id: string) {
  const delivery = await prismaSingleton.webhookDelivery.findUnique({
    where: { id },
    include: { endpoint: true, event: true },
  });

  if (!delivery) {
    throw new NotFoundError(`Webhook delivery with ID ${id} was not found.`);
  }

  return send(delivery.endpoint, delivery.event);
}

async function dispatch(event: Event) {
  const subscribedEndpoints =
    await webhookEndpointService.findAllSubscribedToEvent(event.type);

  for (const endpoint of subscribedEndpoints) {
    const events = endpoint.events as EventType[];
    if (!events.includes(event.type)) continue;
    await send(endpoint, event);
  }
}

export const webhookDeliveryService = {
  getMetrics,
  send,
  retry,
  dispatch,
  findAll,
  findAllByEndpointId,
};
