import { authMiddleware } from "../middlewares/auth.middleware.ts";
import type { FastifyInstance } from "fastify";
import { checkoutService } from "../services/checkout.service.ts";
import {
  completeCheckoutSchema,
  createCheckoutSchema,
} from "../schemas/checkout.schema.ts";
import { checkoutListSchema } from "../schemas/checkout.schema.ts";
import { checkoutDocs } from "../docs/checkout.docs.ts";

export async function checkoutRoutes(app: FastifyInstance) {
  app.get("/", { schema: checkoutDocs.findAll }, async (request, reply) => {
    const paginationInput = checkoutListSchema.parse(request.query);
    const checkouts = await checkoutService.findAll(paginationInput);
    return reply.status(200).send(checkouts);
  });

  app.get(
    "/:id",
    { schema: checkoutDocs.getDetails },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const checkout = await checkoutService.getDetails(id);
      return reply.status(200).send(checkout);
    },
  );

  app.post(
    "/",
    {
      schema: checkoutDocs.create,
      preHandler: authMiddleware,
      validatorCompiler: () => (value) => ({ value }),
    },
    async (request, reply) => {
      const input = createCheckoutSchema.parse(request.body);
      const checkout = await checkoutService.create(input);

      return reply.status(201).send(checkout);
    },
  );

  app.post(
    "/:id/complete",
    { schema: checkoutDocs.complete },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const input = completeCheckoutSchema.parse(request.body);
      const checkout = await checkoutService.complete(id, input);
      return reply.status(200).send(checkout);
    },
  );

  app.patch(
    "/:id/cancel",
    { schema: checkoutDocs.cancel },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const checkout = await checkoutService.cancel(id);
      return reply.status(200).send(checkout);
    },
  );
}
