import { createHmac } from "node:crypto";
import { prismaSingleton } from "../../config/prisma.ts";
import type {
  Event,
  EventType,
  WebhookEndpoint,
} from "../../../generated/prisma/client.ts";
import { webhookEndpointService } from "./webhook-endpoint.service.ts";
import type { PaginationInput } from "../../common/pagination.schema.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";

async function findAll(paginationInput: PaginationInput) {
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const [deliveries, total] = await Promise.all([
    prismaSingleton.webhookDelivery.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        endpoint: { select: { url: true } },
      },
    }),
    prismaSingleton.webhookDelivery.count(),
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
  const delivery = await prismaSingleton.webhookDelivery.create({
    data: {
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

  const signature = createHmac("sha256", endpoint.secret)
    .update(body)
    .digest("hex");

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
      body,
    });

    await prismaSingleton.webhookDelivery.update({
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
    await prismaSingleton.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "FAILED",
        deliveredAt: new Date(),
        error: err instanceof Error ? err.message : "Unknown error",
      },
    });
  }
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
  send,
  dispatch,
  findAll,
  findAllByEndpointId,
};
