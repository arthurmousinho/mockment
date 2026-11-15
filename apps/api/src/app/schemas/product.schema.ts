import { z } from "zod";
import { PaymentCurrency } from "../../../generated/prisma/enums.ts";
import { searchablePaginationSchema } from "../../common/search.schema.ts";

export const productListSchema = searchablePaginationSchema;
export type ProductListInput = z.infer<typeof productListSchema>;

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(255).optional(),
  externalId: z.string().trim().min(1).max(255),
  priceInCents: z.number().int().min(0).max(2147483647),
  currency: z.enum(PaymentCurrency),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  externalId: z.string(),
  priceInCents: z.number(),
  currency: z.enum(PaymentCurrency),
  enabled: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
