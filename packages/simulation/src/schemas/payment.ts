import { z } from "zod";

const paymentIdSchema = z
  .string({ error: "paymentId must be a string." })
  .trim()
  .min(1, { error: "paymentId is required." });

export const paymentCreateInputSchema = z.object({
  amountInCents: z
    .number({ error: "amountInCents must be a number." })
    .int({ error: "amountInCents must be an integer." })
    .positive({ error: "amountInCents must be greater than zero." }),
  currency: z.enum(["BRL", "USD", "EUR"], {
    error: "currency must be BRL, USD or EUR.",
  }),
  method: z.enum(["PIX", "CARD", "BANK_SLIP"], {
    error: "method must be PIX, CARD or BANK_SLIP.",
  }),
});

export const paymentGetInputSchema = z.object({ paymentId: paymentIdSchema });

export const paymentCancelInputSchema = z.object({
  paymentId: paymentIdSchema,
});

export type PaymentCreateInput = z.infer<typeof paymentCreateInputSchema>;
export type PaymentGetInput = z.infer<typeof paymentGetInputSchema>;
export type PaymentCancelInput = z.infer<typeof paymentCancelInputSchema>;
