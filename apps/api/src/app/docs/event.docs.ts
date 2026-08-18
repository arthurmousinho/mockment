import {
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import { findAllEventsSchema } from "../schemas/event.schema.ts";

export const eventDocs = {
  findAll: {
    summary: "List events",
    description: "Returns a paginated list of events.",
    tags: ["Events"],
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "When the events are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(findAllEventsSchema),
          },
        },
      },
    },
  },
};
