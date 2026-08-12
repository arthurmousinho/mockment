import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { env } from "./env.ts";

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Mockment API",
        description:
          "Local-first fake payment gateway for developing and testing payment integrations.",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Local development server",
        },
      ],
      tags: [
        {
          name: "Payments",
          description: "Payment operations",
        },
        {
          name: "Subscriptions",
          description: "Subscription operations",
        },
        {
          name: "Webhooks",
          description: "Webhook operations",
        },
        {
          name: "API Keys",
          description: "API key management",
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });
}
