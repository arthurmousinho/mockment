import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createApiKeyResponseSchema,
  createApiKeySchema,
  findAllApiKeysSchema,
  rotateApiKeyResponseSchema,
} from "../schemas/api-key.schema.ts";

export const apiKeyDocs = {
  findAll: {
    summary: "List API keys",
    description: "Returns a paginated list of API keys.",
    tags: ["API Keys"],
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "When the API keys are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(findAllApiKeysSchema),
          },
        },
      },
    },
  },
  create: {
    summary: "Create an API key",
    description: "Creates a new API key.",
    tags: ["API Keys"],
    body: openApiSchema(createApiKeySchema),
    response: {
      201: {
        description: "When the API key is created successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(createApiKeyResponseSchema),
          },
        },
      },
    },
  },
  revoke: {
    summary: "Revoke an API key",
    description: "Revokes an existing API key.",
    tags: ["API Keys"],
    params: idParamsSchema,
    response: {
      204: { description: "API key revoked successfully" },
      404: {
        description: "When the API key with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Api Key with ID {id} was not found.",
            }),
          },
        },
      },
      409: {
        description:
          "When the API key with the specified ID is already revoked.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "CONFLICT",
              code: 409,
              message: "Api Key with ID {id} was already revoked.",
            }),
          },
        },
      },
    },
  },
  rotate: {
    summary: "Rotate an API key",
    description: "Generates a new secret for an existing API key.",
    tags: ["API Keys"],
    params: idParamsSchema,
    response: {
      200: {
        description: "API key rotated successfully",
        content: {
          "application/json": {
            schema: openApiSchema(rotateApiKeyResponseSchema),
          },
        },
      },
      404: {
        description: "When the API key with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Api Key with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  remove: {
    summary: "Delete an API key",
    description: "Permanently deletes an API key.",
    tags: ["API Keys"],
    params: idParamsSchema,
    response: {
      204: {
        description:
          "When the API key with the specified ID is deleted successfully.",
      },
      404: {
        description: "When the API key with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Api Key with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
};
