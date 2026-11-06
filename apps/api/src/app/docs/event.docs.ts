import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import { findAllEventsSchema } from "../schemas/event.schema.ts";

export const eventDocs = {
  replay: {
    summary: "Replay an event",
    description:
      "Redispatches the stored event to currently subscribed webhook endpoints, preserving its ID, timestamp, and payload. Creates new delivery attempts without creating a new event. Returns after dispatch completes; individual delivery failures are recorded in webhook deliveries.",
    tags: ["Events"],
    params: idParamsSchema,
    response: {
      200: {
        description:
          "Returns the original event after delivery attempts complete, including when no endpoints are subscribed.",
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
