import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import {
  completeCheckoutSchema,
  detailedCheckoutSchema,
  findAllCheckoutsSchema,
} from "../schemas/checkout.schema.ts";

export const checkoutDocs = {
  findAll: {
    summary: "List checkouts",
    description: "Returns a paginated list of checkouts.",
    tags: ["Checkout"],
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "When the checkouts are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(findAllCheckoutsSchema),
          },
        },
      },
    },
  },
  getDetails: {
    summary: "Get checkout details",
    description: "Returns the details of a checkout.",
    tags: ["Checkout"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the checkout is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(detailedCheckoutSchema),
          },
        },
      },
      404: {
        description: "When the checkout with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Checkout with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  complete: {
    summary: "Complete a checkout",
    description: "Completes a checkout with the provided status.",
    tags: ["Checkout"],
    params: idParamsSchema,
    body: openApiSchema(completeCheckoutSchema),
    response: {
      200: {
        description: "When the checkout is completed successfully.",
      },
      404: {
        description: "When the checkout with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Checkout with ID {id} was not found.",
            }),
          },
        },
      },
      409: {
        description:
          "When the checkout cannot be completed because of its payment current state.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "CONFLICT",
              code: 409,
              message:
                "Payment with ID {paymentId} is not in a valid state for completion. Payment status must be CREATED but is {paymentStatus}.",
            }),
          },
        },
      },
    },
  },
};
