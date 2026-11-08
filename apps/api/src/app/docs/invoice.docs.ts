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
} from "../schemas/invoice.schema.ts";

export const invoiceDocs = {
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
        content: { "application/json": { schema: openApiSchema(invoiceSchema) } },
      },
      400: {
        description: "When the invoice cannot transition to PROCESSING.",
        content: {
          "application/json": {
            schema: httpErrorSchema({ error: "BAD_REQUEST", code: 400, message: "Cannot change invoice status from {currentStatus} to PROCESSING." }),
          },
        },
      },
      404: {
        description: "When the invoice is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({ error: "NOT_FOUND", code: 404, message: "Invoice with ID {id} was not found." }),
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
    description: "Creates an new invoice for a payment.",
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
        description: "When the payment is not found for the supplied API key.",
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
