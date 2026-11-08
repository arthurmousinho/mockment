import { z } from "zod";
import { httpErrorSchema, openApiSchema } from "../../common/openapi.ts";
import {
  createInvoiceSchema,
  invoiceSchema,
} from "../schemas/invoice.schema.ts";

export const invoiceDocs = {
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
};
