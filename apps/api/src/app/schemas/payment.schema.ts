import { z } from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";
import {
  EventType,
  PaymentCurrency,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/enums.ts";

export const paymentListSchema = searchablePaginationSchema;
export type PaymentListInput = z.infer<typeof paymentListSchema>;

export const paymentSchema = z.object({
  id: z.string(),
  amountInCents: z.number(),
  currency: z.enum(PaymentCurrency),
  method: z.enum(PaymentMethod),
  status: z.enum(PaymentStatus),
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
  currency: z.enum(PaymentCurrency, { message: "Invalid currency." }),
  method: z.enum(PaymentMethod, { message: "Invalid payment method." }),
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
  checkoutLink: z.url(),
});

export type CreatePaymentOutput = z.infer<typeof createPaymentResponseSchema>;

export const detailedPaymentSchema = paymentSchema.safeExtend({
  events: z.array(
    z.object({
      id: z.string(),
      type: z.enum(EventType),
      createdAt: z.iso.datetime(),
    }),
  ),
});
