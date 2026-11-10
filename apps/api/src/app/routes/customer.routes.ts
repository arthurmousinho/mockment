import { customerDocs } from "../docs/customer.docs.ts";
import {
  createCustomerSchema,
  customerListSchema,
} from "../schemas/customer.schema.ts";
import { customerService } from "../services/customer.service.ts";
import type { FastifyInstance } from "fastify";

export async function customerRoutes(app: FastifyInstance) {
  app.get("/", { schema: customerDocs.findAll }, async (request, reply) => {
    const input = customerListSchema.parse(request.query);
    const customers = await customerService.findAll(input);
    return reply.status(200).send(customers);
  });

  app.post("/", { schema: customerDocs.create }, async (request, reply) => {
    const input = createCustomerSchema.parse(request.body);
    const customer = await customerService.create(input);
    return reply.status(201).send(customer);
  });
}
