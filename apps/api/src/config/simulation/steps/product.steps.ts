import { createProductSchema } from "../../../app/schemas/product.schema.ts";
import type { Step } from "../types.ts";

export const createProductStep = {
  id: "product.create",
  name: "Create product",
  description: "Create a product.",
  input: [
    { name: "name", label: "Name", type: "string", required: true },
    { name: "description", label: "Description", type: "string", required: false },
    { name: "externalId", label: "External ID", type: "string", required: true },
    { name: "priceInCents", label: "Price in cents", type: "number", required: true },
    { name: "currency", label: "Currency", type: "select", required: true, options: createProductSchema.shape.currency.options },
  ],
  output: [
    { name: "id", type: "string" },
    { name: "name", type: "string" },
    { name: "description", type: "string" },
    { name: "externalId", type: "string" },
    { name: "priceInCents", type: "number" },
    { name: "currency", type: "string" },
    { name: "enabled", type: "boolean" },
    { name: "createdAt", type: "string" },
    { name: "updatedAt", type: "string" },
  ],
  executor: { type: "http", method: "POST", endpoint: "/products" },
} satisfies Step;

export const getProductStep = {
  id: "product.get",
  name: "Get product",
  description: "Get an existing product by its ID.",
  input: [{ name: "id", label: "Product ID", type: "string", required: true }],
  output: createProductStep.output,
  executor: { type: "http", method: "GET", endpoint: "/products/:id" },
} satisfies Step;

export const PRODUCT_STEPS = [createProductStep, getProductStep] as const;
