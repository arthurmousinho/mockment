import z from "zod";
import {
  BillingInterval,
  EventType,
  PaymentCurrency,
  PaymentMethod,
  SubscriptionStatus,
} from "../../../generated/prisma/enums.ts";

export const subscriptionSchema = z.object({
  id: z.uuid(),
  description: z.string().nullable(),
  amountInCents: z.number().positive().int(),
  currency: z.enum(PaymentCurrency),
  method: z.enum(PaymentMethod),
  interval: z.enum(BillingInterval),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  intervalCount: z.number().positive().int(),
  status: z.enum(SubscriptionStatus),
  nextBillingAt: z.iso.datetime().nullable(),
  apiKeyId: z.uuid(),
});

export const createSubscriptionSchema = z.object({
  amountInCents: z.coerce
    .number({ error: "O valor deve ser um número." })
    .int({ error: "O valor deve ser um número inteiro." })
    .positive({ error: "O valor deve ser maior que zero." }),
  currency: z.enum(PaymentCurrency, { error: "Moeda inválida." }),
  method: z.enum(PaymentMethod, { error: "Método de pagamento inválido." }),
  description: z
    .string({ error: "A descrição deve ser um texto." })
    .trim()
    .max(255, { error: "A descrição deve ter no máximo 255 caracteres." })
    .optional(),
  interval: z.enum(BillingInterval, { message: "Intervalo inválido" }),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const createSubscriptionResponseSchema = subscriptionSchema.safeExtend({
  checkoutLink: z.url(),
  initPaymentId: z.uuid(),
});

export type CreateSubscriptionOutput = z.infer<
  typeof createSubscriptionResponseSchema
>;

export const updateSubscriptionSchema = z.object({
  amountInCents: z.coerce
    .number({ error: "O valor deve ser um número." })
    .int({ error: "O valor deve ser um número inteiro." })
    .positive({ error: "O valor deve ser maior que zero." })
    .optional(),
  currency: z.enum(PaymentCurrency, { error: "Moeda inválida." }).optional(),
  method: z
    .enum(PaymentMethod, { error: "Método de pagamento inválido." })
    .optional(),
  description: z
    .string({ error: "A descrição deve ser um texto." })
    .trim()
    .max(255, { error: "A descrição deve ter no máximo 255 caracteres." })
    .optional(),
  interval: z
    .enum(BillingInterval, { message: "Intervalo inválido" })
    .optional(),
});

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

export const detailedSubscriptionSchema = subscriptionSchema.safeExtend({
  events: z.array(
    z.object({
      id: z.uuid(),
      type: z.enum(EventType),
      createdAt: z.iso.datetime(),
    }),
  ),
});
