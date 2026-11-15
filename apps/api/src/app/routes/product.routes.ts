import { productDocs } from "../docs/product.docs.ts";
import { createProductSchema } from "../schemas/product.schema.ts";
import { productService } from "../services/product.service.ts";
import type { FastifyInstance } from "fastify";

export async function productRoutes(app: FastifyInstance) {
  app.post("/", { schema: productDocs.create }, async (request, reply) => {
    const input = createProductSchema.parse(request.body);
    const product = await productService.create(input);
    return reply.status(201).send(product);
  });
}
