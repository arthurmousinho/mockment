import { z } from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";
import {
  EventType,
  WebhookDeliveryStatus,
} from "../../../generated/prisma/enums.ts";

export const webhookEndpointListSchema = searchablePaginationSchema;
export type WebhookEndpointListInput = z.infer<
  typeof webhookEndpointListSchema
>;

const paymentEventsSchema = z
  .array(z.enum(EventType), {
    message: "Events must be a valid list.",
  })
  .min(1, "Select at least one event.")
  .refine(
    (events) => new Set(events).size === events.length,
    "Duplicate events are not allowed.",
  );

export const createWebhookEndpointSchema = z.object({
  url: z.url("Invalid URL."),
  events: paymentEventsSchema,
});

export type CreateWebhookEndpointInput = z.infer<
  typeof createWebhookEndpointSchema
>;

export const updateWebhookEndpointSchema = z.object({
  url: z
    .url("Invalid URL.")
    .max(2048, "URL must be at most 2048 characters long.")
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
  eventId: z.uuid(),
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
