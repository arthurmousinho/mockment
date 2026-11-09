import { UnauthorizedError } from "../../common/http-error.ts";
import { invoiceDocs } from "../docs/invoice.docs.ts";
import {
  createInvoiceSchema,
  invoiceListSchema,
  updateInvoiceSchema,
} from "../schemas/invoice.schema.ts";
import { invoiceService } from "../services/invoice.service.ts";
import type { FastifyInstance } from "fastify";

export async function invoiceRoutes(app: FastifyInstance) {
  app.get(
    "/:id/pdf",
    { schema: invoiceDocs.downloadPdf },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const pdf = await invoiceService.getPdf(id);
      return reply
        .type("application/pdf")
        .header(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(id)}.pdf"`,
        )
        .status(200)
        .send(pdf);
    },
  );

  app.get("/", { schema: invoiceDocs.findAll }, async (request, reply) => {
    const input = invoiceListSchema.parse(request.query);
    const invoices = await invoiceService.findAll(input);
    return reply.status(200).send(invoices);
  });

  app.get(
    "/:id",
    { schema: invoiceDocs.getDetails },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const invoice = await invoiceService.getDetails(id);
      return reply.status(200).send(invoice);
    },
  );

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

  app.patch("/:id", { schema: invoiceDocs.update }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = updateInvoiceSchema.parse(request.body);
    const invoice = await invoiceService.update(id, input);
    return reply.status(200).send(invoice);
  });

  app.post(
    "/:id/process",
    { schema: invoiceDocs.process },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const invoice = await invoiceService.process(id);
      return reply.status(200).send(invoice);
    },
  );

  app.post(
    "/:id/issue",
    { schema: invoiceDocs.issue },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const invoice = await invoiceService.issue(id);
      return reply.status(200).send(invoice);
    },
  );

  app.post(
    "/:id/cancel",
    { schema: invoiceDocs.cancel },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const invoice = await invoiceService.cancel(id);
      return reply.status(200).send(invoice);
    },
  );
}
