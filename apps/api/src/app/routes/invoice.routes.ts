import { UnauthorizedError } from "../../common/http-error.ts";
import { invoiceDocs } from "../docs/invoice.docs.ts";
import { createInvoiceSchema } from "../schemas/invoice.schema.ts";
import { invoiceService } from "../services/invoice.service.ts";
import type { FastifyInstance } from "fastify";

export async function invoiceRoutes(app: FastifyInstance) {
  app.post("/", { schema: invoiceDocs.create }, async (request, reply) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Api Key is missing.");
    }

    const apiKey = authorization.slice("Bearer ".length);
    const input = createInvoiceSchema.parse(request.body);
    const invoice = await invoiceService.create(apiKey, input);

    return reply.status(201).send(invoice);
  });
}
