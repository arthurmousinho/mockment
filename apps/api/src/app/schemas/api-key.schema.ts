import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z
    .string({ message: "O nome deve ser um texto" })
    .trim()
    .min(3, "O nome deve possuir pelo menos 3 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),
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
