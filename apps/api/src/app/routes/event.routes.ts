import type { FastifyInstance } from "fastify";
import { eventListSchema } from "../schemas/event.schema.ts";
import { eventDocs } from "../docs/event.docs.ts";
import { eventService } from "../services/event.service.ts";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/", { schema: eventDocs.findAll }, async (request, reply) => {
    const input = eventListSchema.parse(request.query);
    const events = await eventService.findAll(input);
    return reply.status(200).send(events);
  });
}
