import type { Step } from "../types.ts";

export const createInvoiceStep = {
  id: "invoice.create",
  name: "Create invoice",
  description: "Create an invoice for a payment.",
  input: [
    { name: "paymentId", label: "Payment ID", type: "string", required: true },
    {
      name: "customerName",
      label: "Customer name",
      type: "string",
      required: true,
    },
    {
      name: "customerTaxId",
      label: "Customer tax ID",
      type: "string",
      required: false,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "paymentId", type: "string" },
    { name: "customerName", type: "string" },
    { name: "customerTaxId", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "status", type: "string" },
    { name: "issuedAt", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
  ],
  executor: { type: "http", method: "POST", endpoint: "/invoices" },
} satisfies Step;

export const getInvoiceStep = {
  id: "invoice.get",
  name: "Get invoice",
  description: "Get an existing invoice by its ID.",
  input: [
    {
      name: "id",
      label: "Invoice ID",
      type: "string",
      required: true,
    },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "paymentId", type: "string" },
    { name: "customerName", type: "string" },
    { name: "customerTaxId", type: "string" },
    { name: "amountInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "status", type: "string" },
    { name: "issuedAt", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
  ],
  executor: {
    type: "http",
    method: "GET",
    endpoint: "/invoices/:id",
  },
} satisfies Step;

export const INVOICE_STEPS = [createInvoiceStep, getInvoiceStep] as const;
