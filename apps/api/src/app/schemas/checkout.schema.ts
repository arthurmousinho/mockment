import z from "zod";
import { subscriptionDocs } from "../docs/subscription.docs.ts";
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
  id: z.uuid(),
  apiKeyId: z.uuid(),
  createdAt: z.iso.date(),
  successUrl: z.url(),
  cancelUrl: z.url(),
  paymentId: z.uuid(),
  subscriptionId: z.uuid().nullable(),
});

export const detailedCheckoutSchema = z.object({
  id: z.uuid(),
  apiKeyId: z.uuid(),
  createdAt: z.iso.date(),
  successUrl: z.url(),
  cancelUrl: z.url(),
  paymentId: z.uuid(),
  subscriptionId: z.uuid().nullable(),
  payment: paymentSchema,
  subscription: z.any().nullable(),
});
