import z from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";
import {
  BillingInterval,
  EventType,
  PaymentCurrency,
  PaymentMethod,
  SubscriptionStatus,
} from "../../../generated/prisma/enums.ts";

export const subscriptionListSchema = searchablePaginationSchema;
export type SubscriptionListInput = z.infer<typeof subscriptionListSchema>;

export const subscriptionSchema = z.object({
  id: z.string(),
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
  apiKeyId: z.string(),
});

export const createSubscriptionSchema = z.object({
  amountInCents: z.coerce
    .number({ error: "Amount must be a number." })
    .int({ error: "Amount must be an integer." })
    .positive({ error: "Amount must be greater than zero." }),
  currency: z.enum(PaymentCurrency, { error: "Invalid currency." }),
  method: z.enum(PaymentMethod, { error: "Invalid payment method." }),
  description: z
    .string({ error: "Description must be a string." })
    .trim()
    .max(255, { error: "Description must be at most 255 characters long." })
    .optional(),
  interval: z.enum(BillingInterval, { message: "Invalid billing interval." }),
  intervalCount: z.coerce
    .number({ error: "Interval count must be a number." })
    .int({ error: "Interval count must be an integer." })
    .positive({ error: "Interval count must be greater than zero." })
    .default(1),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const createSubscriptionResponseSchema = subscriptionSchema.safeExtend({
  checkoutLink: z.url(),
  initPaymentId: z.string(),
});

export type CreateSubscriptionOutput = z.infer<
  typeof createSubscriptionResponseSchema
>;

export const updateSubscriptionSchema = z.object({
  intervalCount: z.coerce
    .number({ error: "Interval count must be a number." })
    .int({ error: "Interval count must be an integer." })
    .positive({ error: "Interval count must be greater than zero." })
    .optional(),
  amountInCents: z.coerce
    .number({ error: "Amount must be a number." })
    .int({ error: "Amount must be an integer." })
    .positive({ error: "Amount must be greater than zero." })
    .optional(),
  currency: z.enum(PaymentCurrency, { error: "Invalid currency." }).optional(),
  method: z
    .enum(PaymentMethod, { error: "Invalid payment method." })
    .optional(),
  description: z
    .string({ error: "Description must be a string." })
    .trim()
    .max(255, { error: "Description must be at most 255 characters long." })
    .optional(),
  interval: z
    .enum(BillingInterval, { message: "Invalid billing interval." })
    .optional(),
});

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

export const detailedSubscriptionSchema = subscriptionSchema.safeExtend({
  events: z.array(
    z.object({
      id: z.string(),
      type: z.enum(EventType),
      createdAt: z.iso.datetime(),
    }),
  ),
});
