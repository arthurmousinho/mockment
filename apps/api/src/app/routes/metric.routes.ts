import type { FastifyInstance } from "fastify";
import { metricService } from "../services/metric.service.ts";
import { metricDocs } from "../docs/metric.docs.ts";

export async function metricRoutes(app: FastifyInstance) {
  app.get("/", { schema: metricDocs.get }, async (request, reply) => {
    const metrics = await metricService.getMetrics();
    return reply.status(200).send(metrics);
  });
}
