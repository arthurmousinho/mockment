import { z } from "zod";

const checkoutIdSchema = z
  .string({ error: "checkoutId must be a string." })
  .trim()
  .min(1, { error: "checkoutId is required." });

export const checkoutCreateInputSchema = z.object({
  amountInCents: z
    .number({ error: "amountInCents must be a number." })
    .int({ error: "amountInCents must be an integer." })
    .positive({ error: "amountInCents must be greater than zero." }),
  currency: z.enum(["BRL", "USD"], {
    error: "currency must be BRL or USD.",
  }),
});

export const checkoutGetInputSchema = z.object({
  checkoutId: checkoutIdSchema,
});

export type CheckoutCreateInput = z.infer<typeof checkoutCreateInputSchema>;
export type CheckoutGetInput = z.infer<typeof checkoutGetInputSchema>;
