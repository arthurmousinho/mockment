import type { FastifyInstance } from "fastify";
import { paginationSchema } from "../../common/pagination.schema.ts";
import { paymentEventService } from "../services/payment-event.service.ts";
import { paymentEventDocs } from "../docs/payment-event.docs.ts";

export async function paymentEventRoutes(app: FastifyInstance) {
  app.get("/", { schema: paymentEventDocs.findAll }, async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
    const events = await paymentEventService.findAll(paginationInput);
    return reply.status(200).send(events);
  });
}
