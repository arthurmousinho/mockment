import type { FastifyInstance } from "fastify";
import { paymentEventService } from "../services/payment-event.service.ts";
import { paginationSchema } from "../../common/pagination.schema.ts";

export async function paymentEventRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
    const events = await paymentEventService.findAll(paginationInput);
    return reply.status(200).send(events);
  });
}
