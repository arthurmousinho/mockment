import z from "zod";
import { paymentSchema } from "./payment.schema.ts";
import { searchablePaginationSchema } from "../../common/search.schema.ts";
import {
  CheckoutStatus,
  PaymentCurrency,
  PaymentMethod,
} from "../../../generated/prisma/enums.ts";

export const checkoutSchema = z.object({
  id: z.string(),
  status: z.enum(CheckoutStatus),
  amountInCents: z.number(),
  currency: z.enum(PaymentCurrency),
  allowedMethods: z.array(z.enum(PaymentMethod)),
  successUrl: z.url(),
  cancelUrl: z.url(),
  customerId: z.string().nullable(),
  apiKeyId: z.string(),
  paymentId: z.string().nullable(),
  subscriptionId: z.string().nullable(),
  expiresAt: z.iso.datetime().nullable(),
  completedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export const createCheckoutSchema = z.object({
  amountInCents: z.coerce
    .number({ message: "Amount must be a number." })
    .int({ message: "Amount must be an integer." })
    .positive({ message: "Amount must be greater than zero." })
    .max(2147483647, { message: "Amount must fit in a 32-bit integer." }),
  currency: z.enum(PaymentCurrency, { message: "Invalid currency." }),
  allowedMethods: z
    .array(z.enum(PaymentMethod, { message: "Invalid payment method." }))
    .min(1, { message: "At least one payment method is required." }),
  customerId: z.string().trim().min(1).max(191).optional(),
  subscriptionId: z.string().trim().min(1).max(191).optional(),
  successUrl: z.url({ message: "Invalid success URL." }).max(191).optional(),
  cancelUrl: z.url({ message: "Invalid cancel URL." }).max(191).optional(),
  expiresAt: z.iso
    .datetime({ offset: true, message: "Invalid expiration date." })
    .optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export const createCheckoutResponseSchema = checkoutSchema.safeExtend({
  link: z.url(),
});

export const checkoutListSchema = searchablePaginationSchema;
export type CheckoutListInput = z.infer<typeof checkoutListSchema>;

export type GenerateCheckoutLinkInput = {
  apiKeyId: string;
  paymentId: string;
  subscriptionId?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutCompletionStatus = "APPROVED" | "DECLINED" | "CANCELED";

const CHECKOUT_COMPLETION_STATUS: readonly CheckoutCompletionStatus[] = [
  "APPROVED",
  "DECLINED",
  "CANCELED",
] as const;

export const completeCheckoutSchema = z.object({
  status: z.enum(CHECKOUT_COMPLETION_STATUS, { message: "Invalid status" }),
});

export const findAllCheckoutsSchema = z.object({
  id: z.string(),
  apiKeyId: z.string(),
  createdAt: z.iso.datetime(),
  successUrl: z.url(),
  cancelUrl: z.url(),
  paymentId: z.string(),
  subscriptionId: z.string().nullable(),
  link: z.url(),
});

export const detailedCheckoutSchema = z.object({
  id: z.string(),
  apiKeyId: z.string(),
  createdAt: z.iso.datetime(),
  successUrl: z.url(),
  cancelUrl: z.url(),
  paymentId: z.string(),
  subscriptionId: z.string().nullable(),
  payment: paymentSchema,
  subscription: z.any().nullable(),
});

export const completeCheckoutResponseSchema = detailedCheckoutSchema.omit({
  payment: true,
  subscription: true,
});
