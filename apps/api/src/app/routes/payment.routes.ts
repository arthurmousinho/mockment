import { UnauthorizedError } from "../../common/http-error.ts";
import { paginationSchema } from "../../common/pagination.schema.ts";
import { paymentDocs } from "../docs/payment.docs.ts";
import { createPaymentSchema } from "../schemas/payment.schema.ts";
import { paymentService } from "../services/payment.service.ts";
import type { FastifyInstance } from "fastify";

export async function paymentRoutes(app: FastifyInstance) {
  app.get("/", { schema: paymentDocs.findAll }, async (request, reply) => {
    const paginationInput = paginationSchema.parse(request.query);
    const payments = await paymentService.findAll(paginationInput);
    return reply.status(200).send(payments);
  });

  app.get(
    "/:id",
    { schema: paymentDocs.getDetails },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const payment = await paymentService.getDetails(id);
      console.log(payment);
      return reply.status(200).send(payment);
    },
  );

  app.post("/", { schema: paymentDocs.create }, async (request, reply) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Api Key is missing.");
    }

    const apiKey = authorization.slice("Bearer ".length);
    const input = createPaymentSchema.parse(request.body);
    const payment = await paymentService.create(apiKey, input);

    return reply.status(201).send(payment);
  });

  app.patch(
    "/:id/approve",
    { schema: paymentDocs.approve },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const payment = await paymentService.changeStatus(id, "APPROVED");
      return reply.status(200).send(payment);
    },
  );

  app.patch(
    "/:id/decline",
    { schema: paymentDocs.decline },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const payment = await paymentService.changeStatus(id, "DECLINED");
      return reply.status(200).send(payment);
    },
  );

  app.patch(
    "/:id/cancel",
    { schema: paymentDocs.cancel },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const payment = await paymentService.changeStatus(id, "CANCELED");
      return reply.status(200).send(payment);
    },
  );

  app.patch(
    "/:id/process",
    { schema: paymentDocs.process },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const payment = await paymentService.changeStatus(id, "PROCESSING");
      return reply.status(200).send(payment);
    },
  );
}
