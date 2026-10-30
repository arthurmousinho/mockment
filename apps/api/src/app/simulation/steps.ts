import { createPaymentSchema } from "../schemas/payment.schema.ts";
import { createSubscriptionSchema } from "../schemas/subscription.schema.ts";
import type { Step } from "./types.ts";

export const createPaymentStep = {
  id: "payment.create",
  name: "Create payment",
  description: "Create a payment and generate its checkout link.",
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
      options: createPaymentSchema.shape.currency.options,
    },
    {
      name: "method",
      label: "Payment method",
      type: "select",
      required: true,
      options: createPaymentSchema.shape.method.options,
    },
    {
      name: "successUrl",
      label: "Success URL",
      type: "string",
      required: false,
    },
    {
      name: "cancelUrl",
      label: "Cancel URL",
      type: "string",
      required: false,
    },
    {
      name: "description",
      label: "Description",
      type: "string",
      required: false,
    },
    {
      name: "externalId",
      label: "External ID",
      type: "string",
      required: false,
    },
    {
      name: "idempotencyKey",
      label: "Idempotency key",
      type: "string",
      required: false,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "status", type: "string" },
    { name: "description", type: "string" },
    { name: "externalId", type: "string" },
    { name: "idempotencyKey", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
    { name: "checkoutLink", type: "string" },
  ],
  executor: {
    type: "http",
    method: "POST",
    endpoint: "/payments",
  },
} satisfies Step;

export const processPaymentStep = {
  id: "payment.process",
  name: "Process payment",
  description: "Move an existing payment to the processing state.",
  input: [
    {
      name: "id",
      label: "Payment ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "status", type: "string" },
    { name: "description", type: "string" },
    { name: "externalId", type: "string" },
    { name: "idempotencyKey", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
  ],
  executor: {
    type: "http",
    method: "PATCH",
    endpoint: "/payments/:id/process",
  },
} satisfies Step;

export const approvePaymentStep = {
  id: "payment.approve",
  name: "Approve payment",
  description: "Approve an existing payment.",
  input: [
    {
      name: "id",
      label: "Payment ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "status", type: "string" },
    { name: "description", type: "string" },
    { name: "externalId", type: "string" },
    { name: "idempotencyKey", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
  ],
  executor: {
    type: "http",
    method: "PATCH",
    endpoint: "/payments/:id/approve",
  },
} satisfies Step;

export const declinePaymentStep = {
  id: "payment.decline",
  name: "Decline payment",
  description: "Decline an existing payment.",
  input: [
    {
      name: "id",
      label: "Payment ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "status", type: "string" },
    { name: "description", type: "string" },
    { name: "externalId", type: "string" },
    { name: "idempotencyKey", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
  ],
  executor: {
    type: "http",
    method: "PATCH",
    endpoint: "/payments/:id/decline",
  },
} satisfies Step;

export const cancelPaymentStep = {
  id: "payment.cancel",
  name: "Cancel payment",
  description: "Cancel an existing payment.",
  input: [
    {
      name: "id",
      label: "Payment ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "method", type: "string" },
    { name: "status", type: "string" },
    { name: "description", type: "string" },
    { name: "externalId", type: "string" },
    { name: "idempotencyKey", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
  ],
  executor: {
    type: "http",
    method: "PATCH",
    endpoint: "/payments/:id/cancel",
  },
} satisfies Step;

export const createSubscriptionStep = {
  id: "subscription.create",
  name: "Create subscription",
  description: "Create a subscription and generate its initial payment checkout link.",
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

export const STEPS = [
  createPaymentStep,
  processPaymentStep,
  approvePaymentStep,
  declinePaymentStep,
  cancelPaymentStep,
  createSubscriptionStep,
  cancelSubscriptionStep,
  resumeSubscriptionStep,
] as const;
