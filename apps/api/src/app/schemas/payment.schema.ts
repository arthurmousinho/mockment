import { z } from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";
import {
  EventType,
  PaymentCurrency,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/enums.ts";

export const paymentListSchema = searchablePaginationSchema;
export const paymentMetricsParamsSchema = z.object({
  currency: z.enum(PaymentCurrency),
});
export const paymentMetricsSchema = z.object({
  requestedAt: z.iso.datetime(),
  countByStatus: z.record(z.enum(PaymentStatus), z.number()),
  countByMethod: z.record(z.enum(PaymentMethod), z.number()),
  totalPaymentVolume: z.number(),
  approvedVolume: z.number(),
  approvalRate: z.number(),
  totalTransactions: z.number(),
  averageTicket: z.number(),
  refundedVolume: z.number(),
  hourlyReport: z.array(
    z.object({
      hour: z.iso.datetime(),
      statuses: z.record(
        z.enum(PaymentStatus),
        z.object({
          count: z.number(),
          volume: z.number(),
        }),
      ),
    }),
  ),
});
export type PaymentListInput = z.infer<typeof paymentListSchema>;

export const paymentSchema = z.object({
  id: z.string(),
  amountInCents: z.number(),
  currency: z.enum(PaymentCurrency),
  method: z.enum(PaymentMethod),
  status: z.enum(PaymentStatus),
  customerId: z.string().nullable(),
  description: z.string().nullable(),
  externalId: z.string().nullable(),
  idempotencyKey: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createPaymentSchema = z.object({
  amountInCents: z.coerce
    .number({ message: "Amount must be a number." })
    .int({ message: "Amount must be an integer." })
    .positive({ message: "Amount must be greater than zero." }),
  customerId: z
    .string({ message: "Customer ID must be a valid string" })
    .trim()
    .min(1, { message: "Customer ID must be at least 1 character long." })
    .max(191, { message: "Customer ID must be at most 191 characters long." })
    .optional(),
  currency: z.enum(PaymentCurrency, { message: "Invalid currency." }),
  method: z.enum(PaymentMethod, { message: "Invalid payment method." }),
  successUrl: z.url({ message: "Invalid success URL." }).optional(),
  cancelUrl: z.url({ message: "Invalid cancel URL." }).optional(),
  description: z
    .string({ message: "Description must be a string." })
    .trim()
    .max(255, { message: "Description must be at most 255 characters long." })
    .optional(),
  externalId: z
    .string({ message: "External ID must be a string." })
    .trim()
    .max(255, {
      message: "External ID must be at most 255 characters long.",
    })
    .optional(),
  idempotencyKey: z
    .string({ message: "Idempotency key must be a string." })
    .trim()
    .max(255, {
      message: "Idempotency key must be at most 255 characters long.",
    })
    .optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const createPaymentResponseSchema = paymentSchema.safeExtend({
  checkoutId: z.string().nullable(),
  checkoutLink: z.url(),
});

export type CreatePaymentOutput = z.infer<typeof createPaymentResponseSchema>;

export const detailedPaymentSchema = paymentSchema.safeExtend({
  checkoutId: z.string().nullable(),
  checkoutLink: z.url().nullable(),
  events: z.array(
    z.object({
      id: z.string(),
      type: z.enum(EventType),
      createdAt: z.iso.datetime(),
    }),
  ),
});
