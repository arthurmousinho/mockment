import {
  completeCheckoutSchema,
  createStandaloneCheckoutSchema,
} from "../../../app/schemas/checkout.schema.ts";
import type { Step, StepConnection } from "../types.ts";

function migrateCheckoutMethods(
  input: Record<string, unknown>,
  connections: StepConnection[],
) {
  if (
    input.allowedMethods !== undefined ||
    (input.method === undefined &&
      !connections.some(
        (connection) => connection.targetHandle === "input:method",
      ))
  )
    return { input, connections };
  const { method, ...rest } = input;
  return {
    input: { ...rest, allowedMethods: [method ?? ""] },
    connections: connections.map((connection) => ({
      ...connection,
      targetHandle:
        connection.targetHandle === "input:method"
          ? "input:allowedMethods:0"
          : connection.targetHandle,
    })),
  };
}

function migrateProductCheckoutInput(
  input: Record<string, unknown>,
  connections: StepConnection[],
) {
  ({ input, connections } = migrateCheckoutMethods(input, connections));
  if (
    input.products !== undefined ||
    !(
      Array.isArray(input.productId) ||
      typeof input.productId === "string" ||
      connections.some(
        (connection) => connection.targetHandle === "input:productId",
      )
    )
  ) {
    return { input, connections };
  }

  const { productId, quantity, ...rest } = input;
  const ids = Array.isArray(productId) ? productId : [productId];
  return {
    input: {
      ...rest,
      products: ids.map((id) => ({ productId: id, quantity })),
    },
    connections: connections.flatMap((connection) => {
      if (connection.targetHandle === "input:quantity") {
        return ids.map((_, index) => ({
          ...connection,
          targetHandle: `input:products:${index}:quantity`,
        }));
      }
      const targetHandle = connection.targetHandle
        .replace(/^input:productId:(\d+)$/, "input:products:$1:productId")
        .replace(/^input:productId$/, "input:products:0:productId");
      return [{ ...connection, targetHandle }];
    }),
  };
}

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

export const createStandaloneCheckoutStep = {
  id: "checkout.createStandalone",
  name: "Create standalone checkout",
  description: "Create a checkout for an amount.",
  migrateInput: migrateCheckoutMethods,
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
      options: createStandaloneCheckoutSchema.shape.currency.options,
    },
    {
      name: "allowedMethods",
      label: "Payment methods",
      type: "string[]",
      required: true,
      options: completeCheckoutSchema.shape.method.options,
    },
    {
      name: "customerId",
      label: "Customer ID",
      type: "string",
      required: false,
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
  output: createSubscriptionCheckoutStep.output,
  executor: { type: "http", method: "POST", endpoint: "/checkouts" },
} satisfies Step;

export const createProductsCheckoutStep = {
  id: "checkout.createProducts",
  name: "Create product checkout",
  description: "Create a checkout for products and their quantities.",
  migrateInput: migrateProductCheckoutInput,
  input: [
    {
      name: "products",
      label: "Products",
      type: "object[]",
      required: true,
      fields: [
        {
          name: "productId",
          label: "Product ID",
          type: "string",
          required: true,
        },
        { name: "quantity", label: "Quantity", type: "number", required: true },
      ],
    },
    {
      name: "allowedMethods",
      label: "Payment methods",
      type: "string[]",
      required: true,
      options: completeCheckoutSchema.shape.method.options,
    },
    {
      name: "customerId",
      label: "Customer ID",
      type: "string",
      required: false,
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
  output: createSubscriptionCheckoutStep.output,
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
  createStandaloneCheckoutStep,
  createSubscriptionCheckoutStep,
  createProductsCheckoutStep,
  getCheckoutStep,
  completeCheckoutStep,
  cancelCheckoutStep,
] as const;
