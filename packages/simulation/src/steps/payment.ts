import type { SimulationStepDefinition } from "../types.ts";

export const paymentSteps = {
  "payment.create": {
    id: "payment.create",
    name: "Create payment",
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
          { label: "EUR", value: "EUR" },
        ],
      },
      {
        name: "method",
        label: "Payment method",
        type: "select",
        required: true,
        options: [
          { label: "PIX", value: "PIX" },
          { label: "CARD", value: "CARD" },
          { label: "BANK_SLIP", value: "BANK_SLIP" },
        ],
      },
    ],
    outputFields: [
      { name: "id", label: "Payment ID", type: "string" },
      { name: "status", label: "Status", type: "string" },
    ],
    executor: { type: "http", method: "POST", endpoint: "/payments" },
  },
  "payment.get": {
    id: "payment.get",
    name: "Get payment",
    inputFields: [
      {
        name: "paymentId",
        label: "Payment ID",
        type: "string",
        required: true,
      },
    ],
    outputFields: [
      { name: "id", label: "Payment ID", type: "string" },
      { name: "status", label: "Status", type: "string" },
      { name: "amountInCents", label: "Amount in cents", type: "number" },
      { name: "currency", label: "Currency", type: "string" },
      { name: "method", label: "Payment method", type: "string" },
    ],
    executor: {
      type: "http",
      method: "GET",
      endpoint: "/payments/{paymentId}",
    },
  },
  "payment.cancel": {
    id: "payment.cancel",
    name: "Cancel payment",
    inputFields: [
      {
        name: "paymentId",
        label: "Payment ID",
        type: "string",
        required: true,
      },
    ],
    outputFields: [
      { name: "id", label: "Payment ID", type: "string" },
      { name: "status", label: "Status", type: "string" },
    ],
    executor: {
      type: "http",
      method: "POST",
      endpoint: "/payments/{paymentId}/cancel",
    },
  },
} as const satisfies Record<string, SimulationStepDefinition>;
