import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createSubscriptionResponseSchema,
  createSubscriptionSchema,
  detailedSubscriptionSchema,
  subscriptionSchema,
  updateSubscriptionSchema,
} from "../schemas/subscription.schema.ts";

export const subscriptionDocs = {
  findAll: {
    summary: "List subscriptions",
    description: "Returns a paginated list of subscriptions.",
    tags: ["Subscriptions"],
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "When the subscriptions are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(subscriptionSchema),
          },
        },
      },
    },
  },
  getDetails: {
    summary: "Get subscription details",
    description: "Returns the details of a subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the subscription is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(detailedSubscriptionSchema),
          },
        },
      },
      404: {
        description:
          "When the subscription with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Subscription with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  create: {
    summary: "Create a subscription",
    description: "Creates a new subscription.",
    tags: ["Subscriptions"],
    body: openApiSchema(createSubscriptionSchema),
    response: {
      201: {
        description: "When the subscription is created successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(createSubscriptionResponseSchema),
          },
        },
      },
    },
  },
  update: {
    summary: "Update a subscription",
    description: "Updates an existing subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
    body: openApiSchema(updateSubscriptionSchema),
    response: {
      200: {
        description: "When the subscription is updated successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(subscriptionSchema),
          },
        },
      },
      404: {
        description:
          "When the subscription with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Subscription with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  cancel: {
    summary: "Cancel a subscription",
    description: "Cancels an existing subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the subscription is cancelled successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(subscriptionSchema),
          },
        },
      },
      404: {
        description:
          "When the subscription with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Subscription with ID {id} was not found.",
            }),
          },
        },
      },
      400: {
        description:
          "When the subscription status cannot be changed from its current state.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change subscription status from {currentStatus} to CANCELED.",
            }),
          },
        },
      },
    },
  },
  resume: {
    summary: "Resume a subscription",
    description: "Resumes an existing subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the subscription is resumed successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(subscriptionSchema),
          },
        },
      },
      404: {
        description:
          "When the subscription with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Subscription with ID {id} was not found.",
            }),
          },
        },
      },
      400: {
        description:
          "When the subscription status cannot be changed from its current state.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change subscription status from {currentStatus} to ACTIVE.",
            }),
          },
        },
      },
    },
  },
  pause: {
    summary: "Pause a subscription",
    description: "Pauses an existing subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the subscription is paused successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(subscriptionSchema),
          },
        },
      },
      404: {
        description:
          "When the subscription with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Subscription with ID {id} was not found.",
            }),
          },
        },
      },
      400: {
        description:
          "When the subscription status cannot be changed from its current state.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change subscription status from {currentStatus} to PAUSED.",
            }),
          },
        },
      },
    },
  },
};
