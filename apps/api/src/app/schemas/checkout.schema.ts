import z from "zod";

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
