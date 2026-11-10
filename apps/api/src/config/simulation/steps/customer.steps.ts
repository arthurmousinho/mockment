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

export const getCustomerStep = {
  id: "customer.get",
  name: "Get customer",
  description: "Get an existing customer by its ID.",
  input: [{ name: "id", label: "Customer ID", type: "string", required: true }],
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
  executor: { type: "http", method: "GET", endpoint: "/customers/:id" },
} satisfies Step;

export const updateCustomerStep = {
  id: "customer.update",
  name: "Update customer",
  description: "Update an existing customer.",
  input: [
    { name: "id", label: "Customer ID", type: "string", required: true },
    { name: "name", label: "Name", type: "string", required: false },
    { name: "email", label: "Email", type: "string", required: false },
    { name: "phone", label: "Phone", type: "string", required: false },
    { name: "document", label: "Document", type: "string", required: false },
    { name: "externalId", label: "External ID", type: "string", required: false },
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
  executor: { type: "http", method: "PATCH", endpoint: "/customers/:id" },
} satisfies Step;

export const deleteCustomerStep = {
  id: "customer.delete",
  name: "Delete customer",
  description: "Delete an existing customer.",
  input: [{ name: "id", label: "Customer ID", type: "string", required: true }],
  output: [],
  executor: { type: "http", method: "DELETE", endpoint: "/customers/:id" },
} satisfies Step;

export const CUSTOMER_STEPS = [
  createCustomerStep,
  getCustomerStep,
  updateCustomerStep,
  deleteCustomerStep,
] as const;
