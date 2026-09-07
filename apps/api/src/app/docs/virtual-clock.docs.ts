import { openApiSchema } from "../../common/openapi.ts";
import {
  setVirtualClockResponseSchema,
  currentVirtualDateTimeSchema,
  advanceVirtualClockSchema,
} from "../schemas/virtual-clock.schema.ts";

export const virtualClockDocs = {
  get: {
    summary: "Get virtual clock",
    description: "Returns the current virtual date and time.",
    tags: ["Virtual Clock"],
    response: {
      200: {
        description: "When the virtual clock is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(currentVirtualDateTimeSchema),
          },
        },
      },
    },
  },
  events: {
    summary: "Subscribe to virtual clock events",
    description:
      "Opens a Server-Sent Events (SSE) stream that sends the current virtual date and time whenever the virtual clock is updated.",
    tags: ["Virtual Clock"],
    response: {
      200: {
        description:
          "A persistent SSE connection that emits virtual clock updates.",
        content: {
          "text/event-stream": {
            schema: {
              type: "string",
              example:
                'event: clock-tick\ndata: "2026-09-07T12:00:00.000Z"\n\n',
            },
          },
        },
      },
    },
  },
  advance: {
    summary: "Advance virtual clock",
    description: "Advances the virtual clock by the specified amount of time.",
    tags: ["Virtual Clock"],
    body: openApiSchema(advanceVirtualClockSchema),
    response: {
      201: {
        description: "When the virtual clock is advanced successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(setVirtualClockResponseSchema),
          },
        },
      },
    },
  },
  reset: {
    summary: "Reset virtual clock",
    description: "Resets the virtual clock to its initial date and time.",
    tags: ["Virtual Clock"],
    response: {
      201: {
        description: "When the virtual clock is reset successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(currentVirtualDateTimeSchema),
          },
        },
      },
    },
  },
  set: {
    summary: "Set virtual clock",
    description: "Sets the virtual clock to a specific date and time.",
    tags: ["Virtual Clock"],
    body: openApiSchema(currentVirtualDateTimeSchema),
    response: {
      200: {
        description: "When the virtual clock is set successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(setVirtualClockResponseSchema),
          },
        },
      },
    },
  },
};
