import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createPaymentResponseSchema,
  createPaymentSchema,
  detailedPaymentSchema,
  paymentSchema,
} from "../schemas/payment.schema.ts";

export const paymentDocs = {
  findAll: {
    summary: "List payments",
    description: "Returns a paginated list of payments.",
    tags: ["Payments"],
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "When the payments are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(paymentSchema),
          },
        },
      },
    },
  },
  getDetails: {
    summary: "Get payment details",
    description: "Returns the details of a payment.",
    tags: ["Payments"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the payment is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(detailedPaymentSchema),
          },
        },
      },
      404: {
        description: "When the payment with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Payment with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  create: {
    summary: "Create a payment",
    description: "Creates a new payment.",
    tags: ["Payments"],
    body: openApiSchema(createPaymentSchema),
    response: {
      201: {
        description: "When the payment is created successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(createPaymentResponseSchema),
          },
        },
      },
      401: {
        description: "When the api key is not provided or is invalid.",
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
      409: {
        description: "When already exists a payment with the same external ID.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "CONFLICT",
              code: 409,
              message: "Payment with external ID {externalId} already created.",
            }),
          },
        },
      },
    },
  },
  approve: {
    summary: "Approve a payment",
    description: "Approves an existing payment.",
    tags: ["Payments"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the payment is approved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(paymentSchema),
          },
        },
      },
      404: {
        description: "When the payment with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Payment with ID {id} was not found.",
            }),
          },
        },
      },
      400: {
        description:
          "When the payment status cannot be changed from its current state.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change payment status from {currentStatus} to APPROVE.",
            }),
          },
        },
      },
    },
  },
  decline: {
    summary: "Decline a payment",
    description: "Declines an existing payment.",
    tags: ["Payments"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the payment is declined successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(paymentSchema),
          },
        },
      },
      404: {
        description: "When the payment with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Payment with ID {id} was not found.",
            }),
          },
        },
      },
      400: {
        description:
          "When the payment status cannot be changed from its current state.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change payment status from {currentStatus} to DECLINED.",
            }),
          },
        },
      },
    },
  },
  cancel: {
    summary: "Cancel a payment",
    description: "Cancels an existing payment.",
    tags: ["Payments"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the payment is cancelled successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(paymentSchema),
          },
        },
      },
      404: {
        description: "When the payment with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Payment with ID {id} was not found.",
            }),
          },
        },
      },
      400: {
        description:
          "When the payment status cannot be changed from its current state.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change payment status from {currentStatus} to CANCELED.",
            }),
          },
        },
      },
    },
  },
  process: {
    summary: "Process a payment",
    description: "Moves an existing payment to the processing state.",
    tags: ["Payments"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the payment is moved to processing successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(paymentSchema),
          },
        },
      },
      404: {
        description: "When the payment with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Payment with ID {id} was not found.",
            }),
          },
        },
      },
      400: {
        description:
          "When the payment status cannot be changed from its current state.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change payment status from {currentStatus} to PROCESSING.",
            }),
          },
        },
      },
    },
  },
};
