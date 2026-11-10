import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createCustomerSchema,
  customerSchema,
  updateCustomerSchema,
} from "../schemas/customer.schema.ts";

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
  findById: {
    summary: "Get customer details",
    description: "Returns the details of a customer.",
    tags: ["Customers"],
    params: idParamsSchema,
    response: {
      200: {
        description: "When the customer is retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(customerSchema),
          },
        },
      },
      404: {
        description: "When the customer with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Customer with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  update: {
    summary: "Update a customer",
    description: "Updates the supplied fields of a customer.",
    tags: ["Customers"],
    params: idParamsSchema,
    body: openApiSchema(updateCustomerSchema),
    response: {
      200: {
        description: "When the customer is updated successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(customerSchema),
          },
        },
      },
      404: {
        description: "When the customer with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Customer with ID {id} was not found.",
            }),
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
              message:
                "A customer with the same email, document, or external ID already exists.",
            }),
          },
        },
      },
    },
  },
  remove: {
    summary: "Delete a customer",
    description: "Permanently deletes a customer.",
    tags: ["Customers"],
    params: idParamsSchema,
    response: {
      204: { description: "When the customer is deleted successfully." },
      404: {
        description: "When the customer with the specified ID is not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Customer with ID {id} was not found.",
            }),
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
              message:
                "A customer with the same email, document, or external ID already exists.",
            }),
          },
        },
      },
    },
  },
};
