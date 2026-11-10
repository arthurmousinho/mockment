import type { Step } from "../types.ts";

export const createCustomerStep = {
  id: "customer.create",
  name: "Create customer",
  description: "Create a customer.",
  input: [
    { name: "name", label: "Name", type: "string", required: true },
    { name: "email", label: "Email", type: "string", required: true },
    { name: "phone", label: "Phone", type: "string", required: true },
    { name: "document", label: "Document", type: "string", required: true },
    { name: "externalId", label: "External ID", type: "string", required: true },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "name", type: "string" },
    { name: "email", type: "string" },
    { name: "phone", type: "string" },
    { name: "document", type: "string" },
    { name: "externalId", type: "string" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
  ],
  executor: { type: "http", method: "POST", endpoint: "/customers" },
} satisfies Step;

export const CUSTOMER_STEPS = [createCustomerStep] as const;
