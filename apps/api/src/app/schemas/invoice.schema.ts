import { z } from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";
import {
  InvoiceStatus,
  EventType,
  PaymentCurrency,
} from "../../../generated/prisma/enums.ts";

export const invoiceListSchema = searchablePaginationSchema;
export type InvoiceListInput = z.infer<typeof invoiceListSchema>;

export const createInvoiceSchema = z.object({
  paymentId: z.string().trim().min(1).max(191),
  customerId: z.string().trim().min(1).max(191),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = z
  .object({
    customerId: z.string().trim().min(1).max(191),
  })
  .strict();

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

export const invoiceSchema = z.object({
  id: z.string(),
  status: z.enum(InvoiceStatus),
  customerId: z.string(),
  amountInCents: z.number(),
  currency: z.enum(PaymentCurrency),
  paymentId: z.string(),
  issuedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const detailedInvoiceSchema = invoiceSchema.safeExtend({
  events: z.array(
    z.object({
      id: z.string(),
      type: z.enum(EventType),
      createdAt: z.iso.datetime(),
    }),
  ),
});
