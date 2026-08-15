import {
  httpErrorSchema,
  idParamsSchema,
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import {
  findAllWebhookDeliveriesSchema,
  webhookDeliverySchema,
} from "../schemas/webhook.schema.ts";

export const webhookDeliveryDocs = {
  findAll: {
    summary: "List webhook deliveries",
    description: "Returns a paginated list of webhook deliveries.",
    tags: ["Webhook Deliveries"],
    querystring: paginationParamsSchema,
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
