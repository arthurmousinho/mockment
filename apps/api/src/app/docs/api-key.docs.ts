import {
  idParamsSchema,
  openApiSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import { createApiKeySchema } from "../schemas/api-key.schema.ts";

export const apiKeyDocs = {
  findAll: {
    summary: "List API keys",
    description: "Returns a paginated list of API keys.",
    tags: ["API Keys"],
    querystring: paginationParamsSchema,
  },
  create: {
    summary: "Create an API key",
    description: "Creates a new API key.",
    tags: ["API Keys"],
    body: openApiSchema(createApiKeySchema),
  },
  revoke: {
    summary: "Revoke an API key",
    description: "Revokes an existing API key.",
    tags: ["API Keys"],
    params: idParamsSchema,
  },
  rotate: {
    summary: "Rotate an API key",
    description: "Generates a new secret for an existing API key.",
    tags: ["API Keys"],
    params: idParamsSchema,
  },
  remove: {
    summary: "Delete an API key",
    description: "Permanently deletes an API key.",
    tags: ["API Keys"],
    params: idParamsSchema,
  },
};
