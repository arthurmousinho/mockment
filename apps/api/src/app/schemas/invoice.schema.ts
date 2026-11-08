import { z } from "zod";
import {
  InvoiceStatus,
  PaymentCurrency,
} from "../../../generated/prisma/enums.ts";

export const createInvoiceSchema = z.object({
  paymentId: z.string().trim().min(1).max(191),
  customerName: z.string().trim().min(1).max(191),
  customerTaxId: z.string().trim().min(1).max(191).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const invoiceSchema = z.object({
  id: z.string(),
  status: z.enum(InvoiceStatus),
  customerName: z.string(),
  customerTaxId: z.string().nullable(),
  amountInCents: z.number(),
  currency: z.enum(PaymentCurrency),
  paymentId: z.string(),
  issuedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
