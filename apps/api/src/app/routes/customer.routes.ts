import { customerDocs } from "../docs/customer.docs.ts";
import {
  createCustomerSchema,
  customerListSchema,
  updateCustomerSchema,
} from "../schemas/customer.schema.ts";
import { customerService } from "../services/customer.service.ts";
import type { FastifyInstance } from "fastify";

export async function customerRoutes(app: FastifyInstance) {
  app.get("/", { schema: customerDocs.findAll }, async (request, reply) => {
    const input = customerListSchema.parse(request.query);
    const customers = await customerService.findAll(input);
    return reply.status(200).send(customers);
  });

  app.get("/:id", { schema: customerDocs.findById }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const customer = await customerService.findById(id);
    return reply.status(200).send(customer);
  });

  app.patch("/:id", { schema: customerDocs.update }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = updateCustomerSchema.parse(request.body);
    const customer = await customerService.update(id, input);
    return reply.status(200).send(customer);
  });

  app.post("/", { schema: customerDocs.create }, async (request, reply) => {
    const input = createCustomerSchema.parse(request.body);
    const customer = await customerService.create(input);
    return reply.status(201).send(customer);
  });
}
