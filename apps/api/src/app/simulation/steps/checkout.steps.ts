import type { Step } from "../types.ts";

export const getCheckoutStep = {
  id: "checkout.get",
  name: "Get checkout",
  description: "Get an existing checkout and its payment and subscription IDs.",
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
    { name: "apiKeyId", type: "string" },
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

export const CHECKOUT_STEPS = [getCheckoutStep] as const;
