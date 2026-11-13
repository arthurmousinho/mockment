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

export const webhookDeliveryListSchema = searchablePaginationSchema;
export const webhookDeliveryMetricsSchema = z.object({
  requestedAt: z.iso.datetime(),
  totalDeliveries: z.number(),
  deliveredToday: z.number(),
  successRate: z.number(),
  countByStatus: z.object(
    Object.fromEntries(
      Object.values(WebhookDeliveryStatus).map((status) => [
        status,
        z.number(),
      ]),
    ) as Record<WebhookDeliveryStatus, z.ZodNumber>,
  ),
  minuteReport: z.array(
    z.object({
      minute: z.iso.datetime(),
      ...(Object.fromEntries(
        Object.values(WebhookDeliveryStatus).map((status) => [
          status,
          z.number(),
        ]),
      ) as Record<WebhookDeliveryStatus, z.ZodNumber>),
    }),
  ),
});

export type WebhookDeliveryListInput = z.infer<
  typeof webhookDeliveryListSchema
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
  id: z.string(),
  status: z.enum(WebhookDeliveryStatus),
  statusCode: z.number().int().positive().nullable(),
  error: z.string().nullable(),
  endpointId: z.string(),
  eventId: z.string(),
  deliveredAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export const findAllWebhookDeliveriesSchema = webhookDeliverySchema.safeExtend({
  endpoint: z.object({
    url: z.url(),
  }),
});

export const webhookEndpointSchema = z.object({
  enabled: z.boolean(),
  id: z.string(),
  url: z.url(),
  apiKeyId: z.string(),
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

export const toggleWebhookEndpointSchema = z.object({
  enabled: z.boolean(),
});

export const webhookTestResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number().int().positive().nullable(),
  error: z.string().nullable(),
});
