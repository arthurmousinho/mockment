import { UnauthorizedError } from "../../common/http-error.ts";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../schemas/subscription.schema.ts";
import type { FastifyInstance } from "fastify";
import { subscriptionService } from "../services/subscription.service.ts";
import { paginationSchema } from "../../common/pagination.schema.ts";
import { subscriptionDocs } from "../docs/subscription.docs.ts";

export async function subcriptionRoutes(app: FastifyInstance) {
  app.get("/", { schema: subscriptionDocs.findAll }, async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
    const subscriptions = await subscriptionService.findAll(paginationInput);
    return reply.status(200).send(subscriptions);
  });

  app.get(
    "/:id",
    { schema: subscriptionDocs.getDetails },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const subscription = await subscriptionService.getDetails(id);
      return reply.status(200).send(subscription);
    },
  );

  app.post("/", { schema: subscriptionDocs.create }, async (request, reply) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Api Key is missing.");
    }

    const apiKey = authorization.slice("Bearer ".length);
    const input = createSubscriptionSchema.parse(request.body);
    const subscription = await subscriptionService.create(apiKey, input);

    return reply.status(201).send(subscription);
  });

  app.patch(
    "/:id",
    { schema: subscriptionDocs.update },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const input = updateSubscriptionSchema.parse(request.body);
      const updatedSubscription = await subscriptionService.update(id, input);
      return reply.status(200).send(updatedSubscription);
    },
  );

  app.patch(
    "/:id/cancel",
    { schema: subscriptionDocs.cancel },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const subscription = await subscriptionService.changeStatus(
        id,
        "CANCELED",
      );
      return reply.status(200).send(subscription);
    },
  );

  app.patch(
    "/:id/resume",
    { schema: subscriptionDocs.resume },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const subscription = await subscriptionService.changeStatus(id, "ACTIVE");
      return reply.status(200).send(subscription);
    },
  );

  app.patch(
    "/:id/pause",
    { schema: subscriptionDocs.pause },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const subscription = await subscriptionService.changeStatus(id, "PAUSED");
      return reply.status(200).send(subscription);
    },
  );
}
