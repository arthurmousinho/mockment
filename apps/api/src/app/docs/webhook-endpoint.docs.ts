import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createWebhookEndpointResponseSchema,
  createWebhookEndpointSchema,
  findAllWebhookEndpointsSchema,
  rotateWebhookEndpointSecretResponseSchema,
  updateWebhookEndpointSchema,
} from "../schemas/webhook.schema.ts";

export const webhookEndpointDocs = {
  findAll: {
    summary: "List webhook endpoints",
    description: "Returns a paginated list of webhook endpoints.",
    tags: ["Webhook Endpoints"],
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "When the webhook endpoints are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(findAllWebhookEndpointsSchema),
          },
        },
      },
    },
  },
  create: {
    summary: "Create a webhook endpoint",
    description: "Creates a new webhook endpoint.",
    tags: ["Webhook Endpoints"],
    body: openApiSchema(createWebhookEndpointSchema),
    response: {
      201: {
        description: "When the webhook endpoint is created successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(createWebhookEndpointResponseSchema),
          },
        },
      },
      401: {
        description: "When the api key is not provided or is invalid.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "UNAUTHORIZED",
              code: 401,
              message: "Invalid API Key.",
            }),
          },
        },
      },
    },
  },
  update: {
    summary: "Update a webhook endpoint",
    description: "Updates an existing webhook endpoint.",
    tags: ["Webhook Endpoints"],
    params: idParamsSchema,
    body: openApiSchema(updateWebhookEndpointSchema),
    response: {
      200: {
        description: "When the webhook endpoint is updated successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(findAllWebhookEndpointsSchema),
          },
        },
      },
      404: {
        description:
          "When the webhook endpoint with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Webhook endpoint with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  rotateSecret: {
    summary: "Rotate webhook endpoint secret",
    description: "Generates a new secret for an existing webhook endpoint.",
    tags: ["Webhook Endpoints"],
    params: idParamsSchema,
    response: {
      201: {
        description:
          "When the webhook endpoint secret is rotated successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(rotateWebhookEndpointSecretResponseSchema),
          },
        },
      },
      404: {
        description:
          "When the webhook endpoint with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Webhook endpoint with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  remove: {
    summary: "Delete a webhook endpoint",
    description: "Permanently deletes a webhook endpoint.",
    tags: ["Webhook Endpoints"],
    params: idParamsSchema,
    response: {
      204: {
        description: "When the webhook endpoint is deleted successfully.",
      },
      404: {
        description:
          "When the webhook endpoint with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Webhook endpoint with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
};
