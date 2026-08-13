import { paginationParamsSchema } from "../../common/openapi.ts";

export const paymentEventDocs = {
  findAll: {
    summary: "List payment events",
    description: "Returns a paginated list of payment events.",
    tags: ["Payment Events"],
    querystring: paginationParamsSchema,
  },
};
