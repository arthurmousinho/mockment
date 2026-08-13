import {
  idParamsSchema,
  openApiSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createWebhookEndpointSchema,
  updateWebhookEndpointSchema,
} from "../schemas/webhook.schema.ts";

export const webhookEndpointDocs = {
  findAll: {
    summary: "List webhook endpoints",
    description: "Returns a paginated list of webhook endpoints.",
    tags: ["Webhook Endpoints"],
    querystring: paginationParamsSchema,
  },
  create: {
    summary: "Create a webhook endpoint",
    description: "Creates a new webhook endpoint.",
    tags: ["Webhook Endpoints"],
    body: openApiSchema(createWebhookEndpointSchema),
  },
  update: {
    summary: "Update a webhook endpoint",
    description: "Updates an existing webhook endpoint.",
    tags: ["Webhook Endpoints"],
    params: idParamsSchema,
    body: openApiSchema(updateWebhookEndpointSchema),
  },
  rotateSecret: {
    summary: "Rotate webhook endpoint secret",
    description: "Generates a new secret for an existing webhook endpoint.",
    tags: ["Webhook Endpoints"],
    params: idParamsSchema,
  },
  remove: {
    summary: "Delete a webhook endpoint",
    description: "Permanently deletes a webhook endpoint.",
    tags: ["Webhook Endpoints"],
    params: idParamsSchema,
  },
};
