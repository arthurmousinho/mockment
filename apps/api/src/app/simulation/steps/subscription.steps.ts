import { createSubscriptionSchema } from "../../schemas/subscription.schema.ts";
import type { Step } from "../types.ts";

export const createSubscriptionStep = {
  id: "subscription.create",
  name: "Create subscription",
  description:
    "Create a subscription and generate its initial payment checkout link.",
  input: [
    {
      name: "amountInCents",
      label: "Amount in cents",
      type: "number",
      required: true,
    },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      required: true,
      options: createSubscriptionSchema.shape.currency.options,
    },
    {
      name: "method",
      label: "Payment method",
      type: "select",
      required: true,
      options: createSubscriptionSchema.shape.method.options,
    },
    {
      name: "description",
      label: "Description",
      type: "string",
      required: false,
    },
    {
      name: "interval",
      label: "Billing interval",
      type: "select",
      required: true,
      options: createSubscriptionSchema.shape.interval.options,
    },
    {
      name: "intervalCount",
      label: "Interval count",
      type: "number",
      required: false,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "description", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "interval", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
    { name: "intervalCount", type: "number" },
    { name: "status", type: "string" },
    { name: "nextBillingAt", type: "string" },
    { name: "apiKeyId", type: "string" },
    { name: "checkoutLink", type: "string" },
    { name: "initPaymentId", type: "string" },
  ],
  executor: {
    type: "http",
    method: "POST",
    endpoint: "/subscriptions",
  },
} satisfies Step;

export const cancelSubscriptionStep = {
  id: "subscription.cancel",
  name: "Cancel subscription",
  description: "Cancel an existing subscription.",
  input: [
    {
      name: "id",
      label: "Subscription ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "description", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "interval", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
    { name: "intervalCount", type: "number" },
    { name: "status", type: "string" },
    { name: "nextBillingAt", type: "string" },
    { name: "apiKeyId", type: "string" },
  ],
  executor: {
    type: "http",
    method: "PATCH",
    endpoint: "/subscriptions/:id/cancel",
  },
} satisfies Step;

export const resumeSubscriptionStep = {
  id: "subscription.resume",
  name: "Resume subscription",
  description: "Resume an existing subscription.",
  input: [
    {
      name: "id",
      label: "Subscription ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "description", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "interval", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
    { name: "intervalCount", type: "number" },
    { name: "status", type: "string" },
    { name: "nextBillingAt", type: "string" },
    { name: "apiKeyId", type: "string" },
  ],
  executor: {
    type: "http",
    method: "PATCH",
    endpoint: "/subscriptions/:id/resume",
  },
} satisfies Step;

export const pauseSubscriptionStep = {
  id: "subscription.pause",
  name: "Pause subscription",
  description: "Pause an existing subscription.",
  input: [
    {
      name: "id",
      label: "Subscription ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "description", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "interval", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
    { name: "intervalCount", type: "number" },
    { name: "status", type: "string" },
    { name: "nextBillingAt", type: "string" },
    { name: "apiKeyId", type: "string" },
  ],
  executor: {
    type: "http",
    method: "PATCH",
    endpoint: "/subscriptions/:id/pause",
  },
} satisfies Step;

export const SUBSCRIPTION_STEPS = [
  createSubscriptionStep,
  cancelSubscriptionStep,
  resumeSubscriptionStep,
  pauseSubscriptionStep,
] as const;
