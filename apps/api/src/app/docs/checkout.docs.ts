import {
  idParamsSchema,
  openApiSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import { completeCheckoutSchema } from "../schemas/checkout.schema.ts";

export const checkoutDocs = {
  findAll: {
    summary: "List checkouts",
    description: "Returns a paginated list of checkouts.",
    tags: ["Checkout"],
    querystring: paginationParamsSchema,
  },
  getDetails: {
    summary: "Get checkout details",
    description: "Returns the details of a checkout.",
    tags: ["Checkout"],
    params: idParamsSchema,
  },
  complete: {
    summary: "Complete a checkout",
    description: "Completes a checkout with the provided status.",
    tags: ["Checkout"],
    params: idParamsSchema,
    body: openApiSchema(completeCheckoutSchema),
  },
};
