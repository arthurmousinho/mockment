import { ConflictError } from "../../common/http-error.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
  createPrefixedId,
} from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import { buildProductSearchFilter } from "../filters/product.filters.ts";
import type {
  CreateProductInput,
  ProductListInput,
} from "../schemas/product.schema.ts";

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

async function findAll(input: ProductListInput) {
  const { skip, take } = buildPrismaPaginationParams(input);
  const where = buildProductSearchFilter(input.search);
  const [products, total] = await Promise.all([
    prismaSingleton.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.product.count({ where }),
  ]);
  return buildPaginatedResponse({
    data: products,
    page: input.page,
    limit: input.limit,
    total,
  });
}

export const productService = { create, findAll };
