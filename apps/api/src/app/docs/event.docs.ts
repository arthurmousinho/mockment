import {
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import { findAllEventsSchema } from "../schemas/event.schema.ts";

export const eventDocs = {
  findAll: {
    summary: "List events",
    description:
      "Returns a paginated list of events. Search matches partial event, payment, and subscription IDs, or event types. Event type matching is case-insensitive and accepts spaces in place of underscores.",
    tags: ["Events"],
    querystring: searchablePaginationParamsSchema,
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
