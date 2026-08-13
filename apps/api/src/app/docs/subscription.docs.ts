import {
  idParamsSchema,
  openApiSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../schemas/subscription.schema.ts";

export const subscriptionDocs = {
  findAll: {
    summary: "List subscriptions",
    description: "Returns a paginated list of subscriptions.",
    tags: ["Subscriptions"],
    querystring: paginationParamsSchema,
  },
  create: {
    summary: "Create a subscription",
    description: "Creates a new subscription.",
    tags: ["Subscriptions"],
    body: openApiSchema(createSubscriptionSchema),
  },
  update: {
    summary: "Update a subscription",
    description: "Updates an existing subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
    body: openApiSchema(updateSubscriptionSchema),
  },
  cancel: {
    summary: "Cancel a subscription",
    description: "Cancels an existing subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
  },
  resume: {
    summary: "Resume a subscription",
    description: "Resumes an existing subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
  },
  pause: {
    summary: "Pause a subscription",
    description: "Pauses an existing subscription.",
    tags: ["Subscriptions"],
    params: idParamsSchema,
  },
};
