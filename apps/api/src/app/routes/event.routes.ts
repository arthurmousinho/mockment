import type { FastifyInstance } from "fastify";
import { paginationSchema } from "../../common/pagination.schema.ts";
import { eventDocs } from "../docs/event.docs.ts";
import { eventService } from "../services/event.service.ts";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/", { schema: eventDocs.findAll }, async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
    const events = await eventService.findAll(paginationInput);
    return reply.status(200).send(events);
  });
}
