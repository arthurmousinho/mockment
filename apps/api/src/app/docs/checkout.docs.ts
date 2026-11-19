import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  checkoutSchema,
  checkoutSessionSchema,
  detailedCheckoutSchema,
  findAllCheckoutsSchema,
  createCheckoutSchema,
  createCheckoutResponseSchema,
  completeCheckoutSchema,
} from "../schemas/checkout.schema.ts";

export const checkoutDocs = {
  getSession: {
    summary: "Get a checkout session",
    description:
      "Returns an open, unexpired checkout and its subscription, if present.",
    tags: ["Checkout"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the checkout session is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(checkoutSessionSchema),
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
  create: {
    summary: "Create a checkout",
    description:
      "Creates an open checkout using a bearer API key. Provide amount, currency, and allowed methods for a standalone checkout, or a subscription ID to use the subscription's payment details and customer.",
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
    description:
      "Completes an open, unexpired checkout with an approved or declined payment. An associated subscription is activated only when the payment is approved.",
    tags: ["Checkout"],
    params: idParamsSchema,
    body: openApiSchema(completeCheckoutSchema),
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
        description:
          "When the checkout is not open, has expired, or does not allow the selected payment method.",
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
  cancel: {
    summary: "Cancel a checkout",
    description: "Cancels an open checkout.",
    tags: ["Checkout"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the checkout is canceled successfully.",
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
        description: "When the checkout is completed or expired.",
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
