import { randomBytes } from "node:crypto";
import type {
  CreateWebhookEndpointInput,
  WebhookEndpointListInput,
  UpdateWebhookEndpointInput,
} from "../schemas/webhook.schema.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import { apiKeyService } from "./api-key.service.ts";
import { NotFoundError } from "../../common/http-error.ts";
import type {
  EventType,
  WebhookEndpoint,
} from "../../../generated/prisma/client.ts";
import { buildWebhookEndpointSearchFilter } from "../filters/webhook-endpoint.filters.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";

function generateSecret() {
  return `whsec_${randomBytes(32).toString("hex")}`;
}

async function create(apiKey: string, input: CreateWebhookEndpointInput) {
  const validatedApiKey = await apiKeyService.validate(apiKey);
  return await prismaSingleton.webhookEndpoint.create({
    data: {
      url: input.url,
      events: input.events,
      secret: generateSecret(),
      apiKeyId: validatedApiKey.id,
    },
  });
}

async function findAll(input: WebhookEndpointListInput) {
  const { skip, take } = buildPrismaPaginationParams(input);
  const where = buildWebhookEndpointSearchFilter(input.search);
  const [endpoint, total] = await Promise.all([
    prismaSingleton.webhookEndpoint.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      omit: { secret: true },
    }),
    prismaSingleton.webhookEndpoint.count({ where }),
  ]);
  return buildPaginatedResponse({
    data: endpoint,
    page: input.page,
    limit: input.limit,
    total,
  });
}

async function findById(endpointId: string) {
  const endpoint = await prismaSingleton.webhookEndpoint.findUnique({
    where: { id: endpointId },
  });

  if (!endpoint) {
    throw new NotFoundError(
      `Webhook endpoint with ID ${endpointId} was not found.`,
    );
  }

  return endpoint;
}

async function update(endpointId: string, input: UpdateWebhookEndpointInput) {
  const endpoint = await findById(endpointId);
  return await prismaSingleton.webhookEndpoint.update({
    where: { id: endpoint.id },
    data: {
      ...(input.url !== undefined && { url: input.url }),
      ...(input.events !== undefined && {
        events: input.events,
      }),
    },
    omit: { secret: true },
  });
}

async function remove(endpointId: string) {
  const endpoint = await findById(endpointId);
  await prismaSingleton.webhookEndpoint.delete({
    where: { id: endpoint.id },
  });
}

async function rotateSecret(endpointId: string) {
  const endpoint = await findById(endpointId);
  const secret = generateSecret();
  await prismaSingleton.webhookEndpoint.update({
    where: { id: endpoint.id },
    data: { secret },
  });
  return { secret };
}

async function findAllSubscribedToEvent(event: EventType) {
  return await prismaSingleton.$queryRaw<WebhookEndpoint[]>`
    SELECT *
    FROM webhook_endpoints
    WHERE JSON_CONTAINS(events, JSON_ARRAY(${event}))
  `;
}

export const webhookEndpointService = {
  create,
  findAll,
  findById,
  update,
  remove,
  rotateSecret,
  findAllSubscribedToEvent,
};
