import type { FastifyInstance } from "fastify";
import { webhookDeliveryService } from "../services/webhook-delivery.service.ts";
import { paginationSchema } from "../../common/pagination.schema.ts";
import { webhookDeliveryDocs } from "../docs/webhook-delivery.docs.ts";

export async function webhookDeliveryRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { schema: webhookDeliveryDocs.findAll },
    async (request, reply) => {
      const paginationInput = paginationSchema.parse(request.query);
      const deliveries = await webhookDeliveryService.findAll(paginationInput);
      return reply.status(200).send(deliveries);
    },
  );

  app.get(
    "/endpoint/:endpointId",
    { schema: webhookDeliveryDocs.findAllByEndpointId },
    async (request, reply) => {
      const { endpointId } = request.params as { endpointId: string };
      const deliveries =
        await webhookDeliveryService.findAllByEndpointId(endpointId);
      return reply.status(200).send(deliveries);
    },
  );
}
