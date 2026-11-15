import { httpErrorSchema, openApiSchema } from "../../common/openapi.ts";
import {
  createProductSchema,
  productSchema,
} from "../schemas/product.schema.ts";

export const productDocs = {
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
