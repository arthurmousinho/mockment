import { createPaymentSchema } from "../schemas/payment.schema.ts";
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

const steps = [createPaymentStep];
