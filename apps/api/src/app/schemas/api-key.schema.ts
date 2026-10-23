import { z } from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";

export const apiKeyListSchema = searchablePaginationSchema;
export type ApiKeyListInput = z.infer<typeof apiKeyListSchema>;

export const createApiKeySchema = z.object({
  name: z
    .string({ message: "Name must be a string." })
    .trim()
    .min(3, "Name must be at least 3 characters long.")
    .max(100, "Name must be at most 100 characters long."),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

export const findAllApiKeysSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  revokedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type FindAllApiKeysOutput = z.infer<typeof findAllApiKeysSchema>;

export const createApiKeyResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  rawKey: z.string(),
});

export type CreateApiKeyOutput = z.infer<typeof createApiKeyResponseSchema>;

export const rotateApiKeyResponseSchema = z.object({
  rawKey: z.string(),
});

export type RotateApiKeyOutput = z.infer<typeof rotateApiKeyResponseSchema>;
