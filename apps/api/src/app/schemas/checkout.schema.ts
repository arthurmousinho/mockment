import z from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";
import { subscriptionSchema } from "./subscription.schema.ts";
import {
  CheckoutStatus,
  EventType,
  PaymentCurrency,
  PaymentMethod,
} from "../../../generated/prisma/enums.ts";

export const checkoutSchema = z.object({
  id: z.string(),
  status: z.enum(CheckoutStatus),
  amountInCents: z.number(),
  currency: z.enum(PaymentCurrency),
  allowedMethods: z.array(z.enum(PaymentMethod)),
  successUrl: z.url(),
  cancelUrl: z.url(),
  customerId: z.string().nullable(),
  paymentId: z.string().nullable(),
  subscriptionId: z.string().nullable(),
  expiresAt: z.iso.datetime().nullable(),
  completedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

const checkoutOptions = {
  successUrl: z.url({ message: "Invalid success URL." }).max(191).optional(),
  cancelUrl: z.url({ message: "Invalid cancel URL." }).max(191).optional(),
  expiresAt: z.iso
    .datetime({ offset: true, message: "Invalid expiration date." })
    .optional(),
};

export const createStandaloneCheckoutSchema = z.strictObject({
  amountInCents: z.coerce
    .number({ message: "Amount must be a number." })
    .int({ message: "Amount must be an integer." })
    .positive({ message: "Amount must be greater than zero." })
    .max(2147483647, { message: "Amount must fit in a 32-bit integer." }),
  currency: z.enum(PaymentCurrency, { message: "Invalid currency." }),
  allowedMethods: z
    .array(z.enum(PaymentMethod, { message: "Invalid payment method." }))
    .min(1, { message: "At least one payment method is required." }),
  customerId: z.string().trim().min(1).max(191).optional(),
  ...checkoutOptions,
});

export const createSubscriptionCheckoutSchema = z.strictObject({
  subscriptionId: z.string().trim().min(1).max(191),
  ...checkoutOptions,
});

export const createProductsCheckoutSchema = z.strictObject({
  products: z
    .array(
      z.strictObject({
        productId: z.string().trim().min(1).max(191),
        quantity: z.number().int().positive().max(2147483647),
      }),
    )
    .min(1),
  allowedMethods: z
    .array(z.enum(PaymentMethod, { message: "Invalid payment method." }))
    .min(1, { message: "At least one payment method is required." }),
  customerId: z.string().trim().min(1).max(191).optional(),
  ...checkoutOptions,
});

export const createCheckoutSchema = z.union([
  createStandaloneCheckoutSchema.meta({ title: "Standalone checkout" }),
  createSubscriptionCheckoutSchema.meta({ title: "Subscription checkout" }),
  createProductsCheckoutSchema.meta({ title: "Products checkout" }),
]);

export type CreateStandaloneCheckoutInput = z.infer<
  typeof createStandaloneCheckoutSchema
>;
export type CreateSubscriptionCheckoutInput = z.infer<
  typeof createSubscriptionCheckoutSchema
>;
export type CreateProductsCheckoutInput = z.infer<
  typeof createProductsCheckoutSchema
>;

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export const createCheckoutResponseSchema = checkoutSchema.safeExtend({
  link: z.url(),
});

export const checkoutListSchema = searchablePaginationSchema;
export type CheckoutListInput = z.infer<typeof checkoutListSchema>;

export const completeCheckoutSchema = z.object({
  method: z.enum(PaymentMethod, { message: "Invalid payment method." }),
  outcome: z.enum(["APPROVED", "DECLINED"], { message: "Invalid outcome." }),
});
export type CompleteCheckoutInput = z.infer<typeof completeCheckoutSchema>;

export const findAllCheckoutsSchema = checkoutSchema.safeExtend({
  link: z.url(),
});

export const checkoutItemSchema = z.object({
  id: z.string(),
  checkoutId: z.string(),
  productId: z.string(),
  quantity: z.number().int(),
  unitAmountInCents: z.number().int(),
});

export const checkoutSessionSchema = checkoutSchema.safeExtend({
  subscription: subscriptionSchema.nullable(),
  items: z.array(checkoutItemSchema),
});

export const detailedCheckoutSchema = checkoutSchema.safeExtend({
  items: z.array(checkoutItemSchema),
  events: z.array(
    z.object({
      id: z.string(),
      type: z.enum(EventType),
      createdAt: z.iso.datetime(),
    }),
  ),
});

export const completeCheckoutResponseSchema = checkoutSchema;
