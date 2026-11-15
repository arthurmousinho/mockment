import { ConflictError } from "../../common/http-error.ts";
import { createPrefixedId } from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type { CreateProductInput } from "../schemas/product.schema.ts";

async function create(input: CreateProductInput) {
  const existingProduct = await prismaSingleton.product.findUnique({
    where: {
      externalId: input.externalId,
    },
  });

  if (existingProduct) {
    throw new ConflictError(
      `Product with external ID ${input.externalId} already created.`,
    );
  }

  return prismaSingleton.product.create({
    data: {
      id: createPrefixedId("prd"),
      name: input.name,
      description: input.description ?? null,
      priceInCents: input.priceInCents,
      currency: input.currency,
      externalId: input.externalId,
      enabled: true,
    },
  });
}

export const productService = { create };
