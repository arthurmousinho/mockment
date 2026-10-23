import { z } from "zod";
import { paginationSchema } from "./pagination.schema.ts";

export const searchQuerySchema = z.object({
  search: z
    .string({ message: "Search text must be a string." })
    .trim()
    .max(255, { message: "Search text must be at most 255 characters long." })
    .optional()
    .describe("Optional search text. Empty text returns all records."),
});

export const searchablePaginationSchema = paginationSchema.extend(
  searchQuerySchema.shape,
);
