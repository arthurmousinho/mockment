import z from "zod";
import { paymentSchema } from "./payment.schema.ts";

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
