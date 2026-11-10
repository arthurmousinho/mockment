import { z } from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";

export const customerListSchema = searchablePaginationSchema;
export type CustomerListInput = z.infer<typeof customerListSchema>;

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  phone: z.string().trim().min(1).max(255),
  document: z.string().trim().min(1).max(255),
  externalId: z.string().trim().min(1).max(255),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const customerSchema = createCustomerSchema.extend({
  id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
