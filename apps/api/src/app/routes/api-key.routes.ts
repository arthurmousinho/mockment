import { paginationSchema } from "../../common/pagination.schema.ts";
import { apiKeyDocs } from "../docs/api-key.docs.ts";
import { createApiKeySchema } from "../schemas/api-key.schema.ts";
import { apiKeyService } from "../services/api-key.service.ts";
import type { FastifyInstance } from "fastify";

export async function apiKeyRoutes(app: FastifyInstance) {
  app.get("/", { schema: apiKeyDocs.findAll }, async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
    const apiKeys = await apiKeyService.findAll(paginationInput);
    return reply.status(200).send(apiKeys);
  });

  app.post("/", { schema: apiKeyDocs.create }, async (request, reply) => {
    const input = createApiKeySchema.parse(request.body);
    const apiKey = await apiKeyService.create(input);
    return reply.status(201).send(apiKey);
  });

  app.patch(
    "/:id/revoke",
    { schema: apiKeyDocs.revoke },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await apiKeyService.revoke(id);
      return reply.status(204).send();
    },
  );

  app.patch(
    "/:id/rotate",
    { schema: apiKeyDocs.rotate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const apiKey = await apiKeyService.rotate(id);
      return reply.status(200).send(apiKey);
    },
  );

  app.delete("/:id", { schema: apiKeyDocs.remove }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await apiKeyService.remove(id);
    return reply.status(204).send();
  });
}
