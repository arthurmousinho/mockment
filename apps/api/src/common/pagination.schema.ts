import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce
    .number({ message: "Page must be a number" })
    .int({ message: "Page must be an integer" })
    .positive({ message: "Page must be a positive integer" })
    .default(1),
  limit: z.coerce
    .number({ message: "Limit must be a number" })
    .int({ message: "Limit must be an integer" })
    .positive({ message: "Limit must be a positive integer" })
    .max(100, { message: "Limit must be less than or equal to 100" })
    .default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const paginationResponseSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationOutput = z.infer<typeof paginationResponseSchema>;
