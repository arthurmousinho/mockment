import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import { findAllEventsSchema } from "../schemas/event.schema.ts";

export const eventDocs = {
  getDetails: {
    summary: "Get event details",
    description: "Returns the details and payload of an event.",
    tags: ["Events"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the event is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(findAllEventsSchema),
          },
        },
      },
      404: {
        description: "When the event with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Event with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
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
