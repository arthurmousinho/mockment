import { httpErrorSchema, openApiSchema, paginatedResponseSchema, searchablePaginationParamsSchema } from "../../common/openapi.ts";
import { createCustomerSchema, customerSchema } from "../schemas/customer.schema.ts";

export const customerDocs = {
  findAll: {
    summary: "List customers",
    description:
      "Returns a paginated list of customers. Search matches partial IDs, names, emails, phone numbers, documents, and external IDs.",
    tags: ["Customers"],
    querystring: searchablePaginationParamsSchema,
    response: {
      200: {
        description: "When the customers are retrieved successfully.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(customerSchema),
          },
        },
      },
    },
  },
  create: {
    summary: "Create a customer",
    description: "Creates a new customer.",
    tags: ["Customers"],
    body: openApiSchema(createCustomerSchema),
    response: {
      201: {
        description: "When the customer is created successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(customerSchema),
          },
        },
      },
      409: {
        description: "When the email, document, or external ID already exists.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "CONFLICT",
              code: 409,
              message: "A customer with the same email, document, or external ID already exists.",
            }),
          },
        },
      },
    },
  },
};
