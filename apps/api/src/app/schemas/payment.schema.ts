import { z } from "zod";
import {
  EventType,
  PaymentCurrency,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/enums.ts";

export const paymentSchema = z.object({
  id: z.uuid(),
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
    .number({ message: "O valor deve ser um número." })
    .int({ message: "O valor deve ser um número inteiro." })
    .positive({ message: "O valor deve ser maior que zero." }),
  currency: z.enum(PaymentCurrency, { message: "Moeda inválida." }),
  method: z.enum(PaymentMethod, { message: "Método de pagamento inválido." }),
  description: z
    .string({ message: "A descrição deve ser um texto." })
    .trim()
    .max(255, { message: "A descrição deve ter no máximo 255 caracteres." })
    .optional(),
  externalId: z
    .string({ message: "O identificador externo deve ser um texto." })
    .trim()
    .max(255, {
      message: "O identificador externo deve ter no máximo 255 caracteres.",
    })
    .optional(),
  idempotencyKey: z
    .string({ message: "A chave de idempotência deve ser um texto." })
    .trim()
    .max(255, {
      message: "A chave de idempotência deve ter no máximo 255 caracteres.",
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
      id: z.uuid(),
      type: z.enum(EventType),
      createdAt: z.iso.datetime(),
    }),
  ),
});
