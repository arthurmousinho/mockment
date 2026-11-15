import { ConflictError, NotFoundError } from "../../common/http-error.ts";
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

async function findById(id: string) {
  const product = await prismaSingleton.product.findUnique({ where: { id } });

  if (!product) {
    throw new NotFoundError(`Product with ID ${id} was not found.`);
  }

  return product;
}

async function toggle(id: string, enabled: boolean) {
  const product = await findById(id);
  return prismaSingleton.product.update({
    where: { id: product.id },
    data: { enabled },
  });
}

async function remove(id: string) {
  await findById(id);
  await prismaSingleton.product.delete({ where: { id } });
}

export const productService = { create, findAll, findById, toggle, remove };
