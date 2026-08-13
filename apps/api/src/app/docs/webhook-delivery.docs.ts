import {
  idParamsSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";

export const webhookDeliveryDocs = {
  findAll: {
    summary: "List webhook deliveries",
    description: "Returns a paginated list of webhook deliveries.",
    tags: ["Webhook Deliveries"],
    querystring: paginationParamsSchema,
  },
  findAllByEndpointId: {
    summary: "List deliveries by endpoint",
    description: "Returns all webhook deliveries for a specific endpoint.",
    tags: ["Webhook Deliveries"],
    params: {
      ...idParamsSchema,
      properties: {
        endpointId: {
          type: "string",
        },
      },
    },
  },
};
