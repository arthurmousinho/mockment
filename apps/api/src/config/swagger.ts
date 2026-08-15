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
          "Mockment is a local-first mock payment gateway for developers building and testing payment integrations. It simulates payment processing, recurring subscriptions, checkout flows, payment events, and webhook deliveries, providing a predictable environment for development and integration testing without external payment providers.",
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
          description:
            "Core payment operations. Represents the financial transactions created by merchants, including their amount, currency, payment method, status, and lifecycle.",
        },
        {
          name: "Payment Events",
          description:
            "Events generated throughout a payment's lifecycle. Allows integrations to track state changes such as payment creation, processing, approval, decline, and cancellation.",
        },
        {
          name: "Subscriptions",
          description:
            "Recurring billing operations. Represents recurring payment agreements that automatically generate new payments according to a configured billing interval and subscription lifecycle.",
        },
        {
          name: "Webhook Endpoints",
          description:
            "Merchant webhook configurations. Defines the HTTP endpoints where the payment gateway sends asynchronous notifications about payment and subscription events.",
        },
        {
          name: "Webhook Deliveries",
          description:
            "Webhook delivery attempts. Tracks notifications sent by the gateway to merchant endpoints, including their delivery status and retry-related information.",
        },
        {
          name: "API Keys",
          description:
            "Merchant authentication credentials. API keys identify and authenticate applications when communicating with the payment gateway and accessing protected API resources.",
        },
        {
          name: "Checkout",
          description:
            "Payment checkout flow. Represents the process of initiating and completing a payment, connecting the customer's payment interaction with the underlying payment and subscription lifecycle.",
        },
        {
          name: "Virtual Clock",
          description:
            "Development-time virtual time control. Allows payment and subscription lifecycles to be simulated by advancing time without waiting for real-world dates or scheduled intervals.",
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });
}
