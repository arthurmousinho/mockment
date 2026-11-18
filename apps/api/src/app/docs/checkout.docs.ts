import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  checkoutSchema,
  detailedCheckoutSchema,
  findAllCheckoutsSchema,
  createCheckoutSchema,
  createCheckoutResponseSchema,
} from "../schemas/checkout.schema.ts";

export const checkoutDocs = {
  create: {
    summary: "Create a checkout",
    description: "Creates an open checkout using a bearer API key.",
    tags: ["Checkout"],
    body: openApiSchema(createCheckoutSchema),
    response: {
      201: {
        description: "When the checkout is created successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(createCheckoutResponseSchema),
          },
        },
      },
      401: {
        description: "When the API key is missing or invalid.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "UNAUTHORIZED",
              code: 401,
              message: "Invalid API Key.",
            }),
          },
        },
      },
      404: {
        description: "When the customer or subscription is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Customer or subscription not found.",
            }),
          },
        },
      },
      422: {
        description: "When the expiration date is not in the future.",
      },
    },
  },
  findAll: {
    summary: "List checkouts",
    description:
      "Returns a paginated list of checkouts. Search matches checkout, payment, and subscription IDs.",
    tags: ["Checkout"],
    querystring: searchablePaginationParamsSchema,
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
    description: "Completes an open, unexpired checkout.",
    tags: ["Checkout"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the checkout is completed successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(checkoutSchema),
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
      422: {
        description: "When the checkout is not open or has expired.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "UNPROCESSABLE_ENTITY",
              code: 422,
              message: "Checkout with ID {id} is not open.",
            }),
          },
        },
      },
    },
  },
};
