import type { FastifyInstance } from "fastify";
import { virtualClockService } from "../services/virtual-clock.service.ts";
import {
  advanceVirtualClockSchema,
  currentVirtualDateTimeSchema,
} from "../schemas/virtual-clock.schema.ts";
import { virtualClockDocs } from "../docs/virtual-clock.docs.ts";
import { env } from "../../config/env.ts";
import { eventEmitterSingleton } from "../../config/event-emitter.ts";

export async function virtualClockRoutes(app: FastifyInstance) {
  app.get("/", { schema: virtualClockDocs.get }, async (request, reply) => {
    const currentDateTime = await virtualClockService.now();
    return reply.status(200).send({ currentDateTime });
  });

  app.get("/events", async (request, reply) => {
    reply.hijack();

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": env.WEB_URL,
    });

    const onClockTick = (currentDateTime: Date) => {
      reply.raw.write(
        `event: clock-tick\n` +
          `data: ${JSON.stringify(currentDateTime.toISOString())}\n\n`,
      );
    };

    eventEmitterSingleton.on("clock-tick", onClockTick);

    const currentDateTime = await virtualClockService.now();
    onClockTick(currentDateTime);

    request.raw.on("close", () => {
      eventEmitterSingleton.off("clock-tick", onClockTick);
    });
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
    const input = currentVirtualDateTimeSchema.parse(request.body);
    const setResult = await virtualClockService.set(input);
    return reply.status(200).send(setResult);
  });
}
