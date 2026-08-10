import type { FastifyInstance } from "fastify";
import { webhookDeliveryService } from "../services/webhook-delivery.service.ts";
import { paginationSchema } from "../../common/pagination.schema.ts";

export async function webhookDeliveryRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
    const deliveries = await webhookDeliveryService.findAll(paginationInput);
    return reply.status(200).send(deliveries);
  });

  app.get("/endpoint/:endpointId", async (request, reply) => {
    const { endpointId } = request.params as { endpointId: string };
    const deliveries =
      await webhookDeliveryService.findAllByEndpointId(endpointId);
    return reply.status(200).send(deliveries);
  });
}
