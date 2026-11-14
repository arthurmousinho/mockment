import { z } from "zod";
import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createInvoiceSchema,
  detailedInvoiceSchema,
  invoiceSchema,
  updateInvoiceSchema,
} from "../schemas/invoice.schema.ts";

const paymentNotApprovedSchema = openApiSchema(
  z.object({
    error: z.literal("UNPROCESSABLE_ENTITY"),
    code: z.literal(422),
    message: z
      .string()
      .default("Only approved payments can be used to create invoices."),
  }),
);

export const invoiceDocs = {
  remove: {
    summary: "Delete an invoice",
    description:
      "Deletes an invoice in CREATED status. Related events are retained.",
    tags: ["Invoices"],
    params: idParamsSchema,
    response: {
      204: { description: "When the invoice is deleted successfully." },
      400: { description: "When the invoice is not in CREATED status." },
      404: { description: "When the invoice is not found." },
    },
  },
  update: {
    summary: "Update an invoice",
    description:
      "Updates the customer of an invoice in CREATED status. The payment must be approved, and if it has a customer, the invoice customer must match it.",
    tags: ["Invoices"],
    params: idParamsSchema,
    body: openApiSchema(updateInvoiceSchema),
    response: {
      200: {
        description: "When the invoice is updated successfully.",
        content: {
          "application/json": { schema: openApiSchema(invoiceSchema) },
        },
      },
      400: {
        description:
          "When the input is invalid or the invoice is not in CREATED status.",
      },
      404: {
        description: "When the invoice, payment, or customer is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Invoice with ID {id} was not found.",
            }),
          },
        },
      },
      409: {
        description:
          "When the customer does not match the payment's customer, or another non-canceled invoice exists for the payment and customer.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "CONFLICT",
              code: 409,
              message:
                "The customer ID does not match the payment's customer ID.",
            }),
          },
        },
      },
      422: {
        description: "When the payment is not approved.",
        content: {
          "application/json": {
            schema: paymentNotApprovedSchema,
          },
        },
      },
    },
  },
  cancel: {
    summary: "Cancel an invoice",
    description: "Cancels a created, processing, or issued invoice.",
    tags: ["Invoices"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the invoice is canceled successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(invoiceSchema),
          },
        },
      },
      400: {
        description: "When the invoice cannot transition to CANCELED.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change invoice status from {currentStatus} to CANCELED.",
            }),
          },
        },
      },
      404: {
        description: "When the invoice is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Invoice with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  downloadPdf: {
    summary: "Download an invoice PDF",
    description: "Downloads the PDF generated when the invoice was issued.",
    tags: ["Invoices"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the invoice PDF is retrieved successfully.",
        content: {
          "application/pdf": { schema: { type: "string", format: "binary" } },
        },
      },
      404: {
        description: "When the invoice or its PDF is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "PDF for invoice with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  process: {
    summary: "Process an invoice",
    description: "Moves a created invoice to the processing state.",
    tags: ["Invoices"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the invoice is moved to processing successfully.",
        content: {
          "application/json": { schema: openApiSchema(invoiceSchema) },
        },
      },
      400: {
        description: "When the invoice cannot transition to PROCESSING.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change invoice status from {currentStatus} to PROCESSING.",
            }),
          },
        },
      },
      404: {
        description: "When the invoice is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Invoice with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  findAll: {
    summary: "List invoices",
    description:
      "Returns a paginated list of invoices ordered newest first. Search matches partial invoice IDs, payment IDs, customer names, and customer tax IDs.",
    tags: ["Invoices"],
    querystring: searchablePaginationParamsSchema,
    response: {
      200: {
        description: "When the invoices are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(invoiceSchema),
          },
        },
      },
    },
  },
  getDetails: {
    summary: "Get invoice details",
    description: "Returns the details of an invoice, including its events.",
    tags: ["Invoices"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the invoice is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(detailedInvoiceSchema),
          },
        },
      },
      404: {
        description: "When the invoice with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Invoice with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  create: {
    summary: "Create an invoice",
    description:
      "Creates a new invoice for an approved payment. If the payment has a customer, the invoice customer must match it.",
    tags: ["Invoices"],
    body: openApiSchema(createInvoiceSchema),
    response: {
      201: {
        description: "When the invoice is created successfully.",
        content: {
          "application/json": { schema: openApiSchema(invoiceSchema) },
        },
      },
      400: {
        description: "When the invoice input is invalid.",
        content: {
          "application/json": {
            schema: openApiSchema(
              z.object({
                error: z.literal("BAD_REQUEST"),
                code: z.literal(400),
                message: z.array(z.string()),
              }),
            ),
          },
        },
      },
      401: {
        description: "When the API key is missing, invalid, or revoked.",
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
        description: "When the payment or customer is not found.",
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
      409: {
        description:
          "When the customer does not match the payment's customer, or a non-canceled invoice already exists for the payment and customer.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "CONFLICT",
              code: 409,
              message:
                "The customer ID does not match the payment's customer ID.",
            }),
          },
        },
      },
      422: {
        description: "When the payment is not approved.",
        content: {
          "application/json": {
            schema: paymentNotApprovedSchema,
          },
        },
      },
    },
  },
  issue: {
    summary: "Issue an invoice",
    description:
      "Issues an invoice when its current status can transition to ISSUED. The invoice PDF is saved under the API storage directory.",
    tags: ["Invoices"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the invoice is issued successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(invoiceSchema),
          },
        },
      },
      400: {
        description: "When the invoice cannot transition to ISSUED.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "BAD_REQUEST",
              code: 400,
              message:
                "Cannot change invoice status from {currentStatus} to ISSUED.",
            }),
          },
        },
      },
      404: {
        description: "When the invoice is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Invoice with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
};
