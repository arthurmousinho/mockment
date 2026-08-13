import type { FastifyInstance } from "fastify";
import { checkoutService } from "../services/checkout.service.ts";
import { completeCheckoutSchema } from "../schemas/checkout.schema.ts";
import { paginationSchema } from "../../common/pagination.schema.ts";
import { checkoutDocs } from "../docs/checkout.docs.ts";

export async function checkoutRoutes(app: FastifyInstance) {
  app.get("/", { schema: checkoutDocs.findAll }, async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
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
    "/:id/complete",
    { schema: checkoutDocs.complete },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { status } = completeCheckoutSchema.parse(request.body);
      await checkoutService.complete(id, status);
      return reply.status(200).send();
    },
  );
}
