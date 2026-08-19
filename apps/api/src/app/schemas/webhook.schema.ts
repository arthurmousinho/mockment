import { z } from "zod";
import {
  EventType,
  WebhookDeliveryStatus,
} from "../../../generated/prisma/enums.ts";

const paymentEventsSchema = z
  .array(z.enum(EventType), {
    message: "Os eventos devem ser uma lista válida.",
  })
  .min(1, "Selecione pelo menos um evento.")
  .refine(
    (events) => new Set(events).size === events.length,
    "Não é permitido informar eventos duplicados.",
  );

export const createWebhookEndpointSchema = z.object({
  url: z.url("A URL informada é inválida."),
  events: paymentEventsSchema,
});

export type CreateWebhookEndpointInput = z.infer<
  typeof createWebhookEndpointSchema
>;

export const updateWebhookEndpointSchema = z.object({
  url: z
    .string({ message: "A URL deve ser um texto." })
    .trim()
    .url("A URL informada é inválida.")
    .max(2048, "A URL deve possuir no máximo 2048 caracteres.")
    .optional(),
  events: paymentEventsSchema.optional(),
});

export type UpdateWebhookEndpointInput = z.infer<
  typeof updateWebhookEndpointSchema
>;

export const webhookDeliverySchema = z.object({
  id: z.uuid(),
  status: z.enum(WebhookDeliveryStatus),
  statusCode: z.number().int().positive(),
  error: z.string().nullable(),
  endpointId: z.uuid(),
  paymentEventId: z.uuid(),
  deliveredAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

export const findAllWebhookDeliveriesSchema = webhookDeliverySchema.safeExtend({
  endpoint: z.object({
    url: z.url(),
  }),
});

export const webhookEndpointSchema = z.object({
  id: z.uuid(),
  url: z.url(),
  apiKeyId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const findAllWebhookEndpointsSchema = webhookEndpointSchema.safeExtend({
  events: z.array(z.enum(EventType)),
});

export const createWebhookEndpointResponseSchema =
  webhookEndpointSchema.safeExtend({
    events: z.array(z.enum(EventType)),
    secret: z.string(),
  });

export const rotateWebhookEndpointSecretResponseSchema = z.object({
  secret: z.string(),
});
