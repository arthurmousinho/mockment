import type { FastifyInstance } from "fastify";
import { checkoutService } from "../services/checkout.service.ts";
import {
  completeCheckoutSchema,
  createCheckoutSchema,
} from "../schemas/checkout.schema.ts";
import { checkoutListSchema } from "../schemas/checkout.schema.ts";
import { checkoutDocs } from "../docs/checkout.docs.ts";
import { UnauthorizedError } from "../../common/http-error.ts";

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

  app.post("/", { schema: checkoutDocs.create }, async (request, reply) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Api Key is missing.");
    }

    const apiKey = authorization.slice("Bearer ".length);
    const input = createCheckoutSchema.parse(request.body);
    const checkout = await checkoutService.create(apiKey, input);

    return reply.status(201).send(checkout);
  });

  app.post(
    "/:id/complete",
    { schema: checkoutDocs.complete },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      // const { status } = completeCheckoutSchema.parse(request.body);
      const checkout = await checkoutService.complete(id);
      return reply.status(200).send(checkout);
    },
  );
}
