import {
  idParamsSchema,
  openApiSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import { createPaymentSchema } from "../schemas/payment.schema.ts";

export const paymentDocs = {
  findAll: {
    summary: "List payments",
    description: "Returns a paginated list of payments.",
    tags: ["Payments"],
    querystring: paginationParamsSchema,
  },
  getDetails: {
    summary: "Get payment details",
    description: "Returns the details of a payment.",
    tags: ["Payments"],
    params: idParamsSchema,
  },
  create: {
    summary: "Create a payment",
    description: "Creates a new payment.",
    tags: ["Payments"],
    body: openApiSchema(createPaymentSchema),
  },
  approve: {
    summary: "Approve a payment",
    description: "Approves an existing payment.",
    tags: ["Payments"],
    params: idParamsSchema,
  },
  decline: {
    summary: "Decline a payment",
    description: "Declines an existing payment.",
    tags: ["Payments"],
    params: idParamsSchema,
  },
  cancel: {
    summary: "Cancel a payment",
    description: "Cancels an existing payment.",
    tags: ["Payments"],
    params: idParamsSchema,
  },
  process: {
    summary: "Process a payment",
    description: "Moves an existing payment to the processing state.",
    tags: ["Payments"],
    params: idParamsSchema,
  },
};
