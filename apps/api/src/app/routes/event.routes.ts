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

  app.get("/:id", { schema: eventDocs.getDetails }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = await eventService.findById(id);
    return reply.status(200).send(event);
  });

  app.post(
    "/:id/replay",
    { schema: eventDocs.replay },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const event = await eventService.replay(id);
      return reply.status(200).send(event);
    },
  );
}
