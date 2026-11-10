import { httpErrorSchema, openApiSchema } from "../../common/openapi.ts";
import { createCustomerSchema, customerSchema } from "../schemas/customer.schema.ts";

export const customerDocs = {
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
