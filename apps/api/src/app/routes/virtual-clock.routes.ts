import type { FastifyInstance } from "fastify";
import { virtualClockService } from "../services/virtual-clock.service.ts";
import {
  advanceVirtualClockSchema,
  setVirtualClockSchema,
} from "../schemas/virtual-clock.schema.ts";
import { virtualClockDocs } from "../docs/virtual-clock.docs.ts";

export async function virtualClockRoutes(app: FastifyInstance) {
  app.get("/", { schema: virtualClockDocs.get }, async (request, reply) => {
    const currentDateTime = await virtualClockService.now();
    return reply.status(200).send({ currentDateTime });
  });

  app.post(
    "/advance",
    { schema: virtualClockDocs.advance },
    async (request, reply) => {
      const input = advanceVirtualClockSchema.parse(request.body);
      const advanceResult = await virtualClockService.advance(input);
      return reply.status(201).send(advanceResult);
    },
  );

  app.post(
    "/reset",
    { schema: virtualClockDocs.reset },
    async (request, reply) => {
      const currentDateTime = await virtualClockService.reset();
      return reply.status(201).send({ currentDateTime });
    },
  );

  app.put("/", { schema: virtualClockDocs.set }, async (request, reply) => {
    const input = setVirtualClockSchema.parse(request.body);
    const setResult = await virtualClockService.set(input);
    return reply.status(200).send(setResult);
  });
}
