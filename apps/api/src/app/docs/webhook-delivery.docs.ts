import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  findAllWebhookDeliveriesSchema,
  webhookDeliverySchema,
} from "../schemas/webhook.schema.ts";

export const webhookDeliveryDocs = {
  retry: {
    summary: "Retry a webhook delivery",
    description:
      "Resends the original event to its original endpoint, creating a new delivery attempt.",
    tags: ["Webhook Deliveries"],
    params: idParamsSchema,
    response: {
      201: {
        description: "The new delivery attempt, including its success or failure status.",
        content: {
          "application/json": { schema: openApiSchema(webhookDeliverySchema) },
        },
      },
      404: {
        description: "The webhook delivery was not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Webhook delivery with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  findAll: {
    summary: "List webhook deliveries",
    description:
      "Returns a paginated list of webhook deliveries. Search matches partial delivery, event, and endpoint IDs, endpoint URLs, error messages, or delivery statuses. Status matching is case-insensitive.",
    tags: ["Webhook Deliveries"],
    querystring: searchablePaginationParamsSchema,
    response: {
      200: {
        description: "When the webhook deliveries are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(findAllWebhookDeliveriesSchema),
          },
        },
      },
    },
  },
  findAllByEndpointId: {
    summary: "List deliveries by endpoint",
    description: "Returns all webhook deliveries for a specific endpoint.",
    tags: ["Webhook Deliveries"],
    params: {
      properties: {
        endpointId: {
          type: "string",
        },
      },
    },
    response: {
      200: {
        description: "When the webhook deliveries are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(webhookDeliverySchema),
          },
        },
      },
      404: {
        description:
          "When the endpoint with the specified endpoint ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Webhook endpoint with ID {endpointId} was not found.",
            }),
          },
        },
      },
    },
  },
};
