import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createProductSchema,
  productSchema,
} from "../schemas/product.schema.ts";

export const productDocs = {
  findAll: {
    summary: "List products",
    description:
      "Returns a paginated list of products. Search matches partial IDs, names, descriptions, and external IDs.",
    tags: ["Products"],
    querystring: searchablePaginationParamsSchema,
    response: {
      200: {
        description: "When the products are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(productSchema),
          },
        },
      },
    },
  },
  findById: {
    summary: "Get product details",
    description: "Returns the details of a product.",
    tags: ["Products"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the product is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(productSchema),
          },
        },
      },
      404: {
        description: "When the product with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Product with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  create: {
    summary: "Create a product",
    description: "Creates a new product.",
    tags: ["Products"],
    body: openApiSchema(createProductSchema),
    response: {
      201: {
        description: "When the product is created successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(productSchema),
          },
        },
      },
      409: {
        description: "When a product with the same external ID already exists.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "CONFLICT",
              code: 409,
              message: "Product with external ID {externalId} already created.",
            }),
          },
        },
      },
    },
  },
};
