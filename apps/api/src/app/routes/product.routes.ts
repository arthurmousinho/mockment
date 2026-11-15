import { productDocs } from "../docs/product.docs.ts";
import {
  createProductSchema,
  productListSchema,
} from "../schemas/product.schema.ts";
import { productService } from "../services/product.service.ts";
import type { FastifyInstance } from "fastify";

export async function productRoutes(app: FastifyInstance) {
  app.get("/", { schema: productDocs.findAll }, async (request, reply) => {
    const input = productListSchema.parse(request.query);
    const products = await productService.findAll(input);
    return reply.status(200).send(products);
  });

  app.post("/", { schema: productDocs.create }, async (request, reply) => {
    const input = createProductSchema.parse(request.body);
    const product = await productService.create(input);
    return reply.status(201).send(product);
  });
}
