import { productDocs } from "../docs/product.docs.ts";
import {
  createProductSchema,
  productListSchema,
  toggleProductSchema,
} from "../schemas/product.schema.ts";
import { productService } from "../services/product.service.ts";
import type { FastifyInstance } from "fastify";

export async function productRoutes(app: FastifyInstance) {
  app.get("/", { schema: productDocs.findAll }, async (request, reply) => {
    const input = productListSchema.parse(request.query);
    const products = await productService.findAll(input);
    return reply.status(200).send(products);
  });

  app.get("/:id", { schema: productDocs.findById }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const product = await productService.findById(id);
    return reply.status(200).send(product);
  });

  app.post("/", { schema: productDocs.create }, async (request, reply) => {
    const input = createProductSchema.parse(request.body);
    const product = await productService.create(input);
    return reply.status(201).send(product);
  });

  app.patch(
    "/:id/toggle",
    { schema: productDocs.toggle },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { enabled } = toggleProductSchema.parse(request.body);
      const product = await productService.toggle(id, enabled);
      return reply.status(200).send(product);
    },
  );

  app.delete("/:id", { schema: productDocs.remove }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await productService.remove(id);
    return reply.status(204).send();
  });
}
