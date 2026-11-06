import type { FastifyInstance } from "fastify";
import { webhookDeliveryService } from "../services/webhook-delivery.service.ts";
import { paginationSchema } from "../../common/pagination.schema.ts";
import { webhookDeliveryDocs } from "../docs/webhook-delivery.docs.ts";
import { webhookDeliveryListSchema } from "../schemas/webhook.schema.ts";

export async function webhookDeliveryRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { schema: webhookDeliveryDocs.findAll },
    async (request, reply) => {
      const input = webhookDeliveryListSchema.parse(request.query);
      const response = await webhookDeliveryService.findAll(input);
      return reply.status(200).send(response);
    },
  );

  app.get(
    "/endpoint/:endpointId",
    { schema: webhookDeliveryDocs.findAllByEndpointId },
    async (request, reply) => {
      const { endpointId } = request.params as { endpointId: string };
      const paginationInput = paginationSchema.parse(request.query);
      const response = await webhookDeliveryService.findAllByEndpointId(
        endpointId,
        paginationInput,
      );
      return reply.status(200).send(response);
    },
  );
}
