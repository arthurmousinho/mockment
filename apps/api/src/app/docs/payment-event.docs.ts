import {
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import { findAllPaymentEventsSchema } from "../schemas/payment-event.schema.ts";

export const paymentEventDocs = {
  findAll: {
    summary: "List payment events",
    description: "Returns a paginated list of payment events.",
    tags: ["Payment Events"],
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "When the payment events are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(findAllPaymentEventsSchema),
          },
        },
      },
    },
  },
};
