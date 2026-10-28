import type { SimulationStepDefinition } from "../types.ts";

export const checkoutSteps = {
  "checkout.create": {
    id: "checkout.create",
    name: "Create checkout",
    inputFields: [
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
        options: [
          { label: "BRL", value: "BRL" },
          { label: "USD", value: "USD" },
        ],
      },
    ],
    outputFields: [
      { name: "id", label: "Checkout ID", type: "string" },
      { name: "status", label: "Status", type: "string" },
      { name: "url", label: "Checkout URL", type: "string" },
    ],
    executor: { type: "http", method: "POST", endpoint: "/checkouts" },
  },
  "checkout.get": {
    id: "checkout.get",
    name: "Get checkout",
    inputFields: [
      {
        name: "checkoutId",
        label: "Checkout ID",
        type: "string",
        required: true,
      },
    ],
    outputFields: [
      { name: "id", label: "Checkout ID", type: "string" },
      { name: "status", label: "Status", type: "string" },
      { name: "amountInCents", label: "Amount in cents", type: "number" },
      { name: "currency", label: "Currency", type: "string" },
      { name: "url", label: "Checkout URL", type: "string" },
    ],
    executor: {
      type: "http",
      method: "GET",
      endpoint: "/checkouts/{checkoutId}",
    },
  },
} as const satisfies Record<string, SimulationStepDefinition>;
