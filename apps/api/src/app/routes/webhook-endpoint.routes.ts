import { UnauthorizedError } from "../../common/http-error.ts";
import type { FastifyInstance } from "fastify";
import {
  createWebhookEndpointSchema,
  updateWebhookEndpointSchema,
} from "../schemas/webhook.schema.ts";
import { webhookEndpointService } from "../services/webhook-endpoint.service.ts";
import { paginationSchema } from "../../common/pagination.schema.ts";

export async function webhookEndpointRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
    const endpoints = await webhookEndpointService.findAll(paginationInput);
    return reply.status(200).send(endpoints);
  });

  app.post("/", async (request, reply) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Api Key is missing.");
    }

    const apiKey = authorization.slice("Bearer ".length);
    const input = createWebhookEndpointSchema.parse(request.body);
    const endpoint = await webhookEndpointService.create(apiKey, input);

    return reply.status(201).send(endpoint);
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = updateWebhookEndpointSchema.parse(request.body);
    const updatedEndpoint = await webhookEndpointService.update(id, input);
    return reply.status(200).send(updatedEndpoint);
  });

  app.patch("/:id/secret/rotate", async (request, reply) => {
    const { id } = request.params as { id: string };
    const updatedEndpoint = await webhookEndpointService.rotateSecret(id);
    return reply.status(201).send(updatedEndpoint);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await webhookEndpointService.remove(id);
    return reply.status(204).send();
  });
}
