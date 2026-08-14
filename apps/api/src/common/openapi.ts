import { z } from "zod";
import { paginationResponseSchema } from "./pagination.schema.ts";
import { HttpErrorTypes } from "./http-error.ts";

export function openApiSchema<T extends z.ZodType>(schema: T) {
  return z.toJSONSchema(schema, {
    target: "draft-7",
    reused: "inline",
  });
}

export const idParamsSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
} as const;

export const paginationParamsSchema = {
  type: "object",
  properties: {
    page: {
      type: "integer",
      minimum: 1,
      default: 1,
      description: "Page number.",
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 20,
      description: "Number of items per page.",
    },
  },
} as const;

export function paginatedResponseSchema<T extends z.ZodType>(schema: T) {
  return openApiSchema(
    z.object({
      data: z.array(schema),
      pagination: paginationResponseSchema,
    }),
  );
}

export function httpErrorSchema(input: {
  error: string;
  code: number;
  message: string;
}) {
  return openApiSchema(
    z.object({
      error: z.enum(HttpErrorTypes).default(input.error),
      code: z.number().default(input.code),
      message: z.string().default(input.message),
    }),
  );
}
