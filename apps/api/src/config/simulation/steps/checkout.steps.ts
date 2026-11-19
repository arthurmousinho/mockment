import { completeCheckoutSchema } from "../../../app/schemas/checkout.schema.ts";
import type { Step } from "../types.ts";

export const createSubscriptionCheckoutStep = {
  id: "checkout.createSubscription",
  name: "Create subscription checkout",
  description: "Create a checkout for a pending subscription.",
  input: [
    {
      name: "subscriptionId",
      label: "Subscription ID",
      type: "string",
      required: true,
    },
    {
      name: "successUrl",
      label: "Success URL",
      type: "string",
      required: false,
    },
    { name: "cancelUrl", label: "Cancel URL", type: "string", required: false },
    {
      name: "expiresAt",
      label: "Expiration date",
      type: "string",
      required: false,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "status", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "customerId", type: "string" },
    { name: "paymentId", type: "string" },
    { name: "subscriptionId", type: "string" },
    { name: "successUrl", type: "string" },
    { name: "cancelUrl", type: "string" },
    { name: "expiresAt", type: "string" },
    { name: "completedAt", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "link", type: "string" },
  ],
  executor: { type: "http", method: "POST", endpoint: "/checkouts" },
} satisfies Step;

export const getCheckoutStep = {
  id: "checkout.get",
  name: "Get checkout",
  description: "Get an existing checkout by its ID.",
  input: [
    {
      name: "id",
      label: "Checkout ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "status", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "customerId", type: "string" },
    { name: "expiresAt", type: "string" },
    { name: "completedAt", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "successUrl", type: "string" },
    { name: "cancelUrl", type: "string" },
    { name: "paymentId", type: "string" },
    { name: "subscriptionId", type: "string" },
  ],
  executor: {
    type: "http",
    method: "GET",
    endpoint: "/checkouts/:id",
  },
} satisfies Step;

export const completeCheckoutStep = {
  id: "checkout.complete",
  name: "Complete checkout",
  description:
    "Complete an existing checkout with a payment method and outcome.",
  input: [
    {
      name: "id",
      label: "Checkout ID",
      type: "string",
      required: true,
    },
    {
      name: "method",
      label: "Payment method",
      type: "select",
      required: true,
      options: completeCheckoutSchema.shape.method.options,
    },
    {
      name: "outcome",
      label: "Payment outcome",
      type: "select",
      required: true,
      options: completeCheckoutSchema.shape.outcome.options,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "status", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "customerId", type: "string" },
    { name: "expiresAt", type: "string" },
    { name: "completedAt", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "successUrl", type: "string" },
    { name: "cancelUrl", type: "string" },
    { name: "paymentId", type: "string" },
    { name: "subscriptionId", type: "string" },
  ],
  executor: {
    type: "http",
    method: "POST",
    endpoint: "/checkouts/:id/complete",
  },
} satisfies Step;

export const cancelCheckoutStep = {
  id: "checkout.cancel",
  name: "Cancel checkout",
  description: "Cancel an open checkout.",
  input: [{ name: "id", label: "Checkout ID", type: "string", required: true }],
  output: getCheckoutStep.output,
  executor: {
    type: "http",
    method: "PATCH",
    endpoint: "/checkouts/:id/cancel",
  },
} satisfies Step;

export const CHECKOUT_STEPS = [
  createSubscriptionCheckoutStep,
  getCheckoutStep,
  completeCheckoutStep,
  cancelCheckoutStep,
] as const;
