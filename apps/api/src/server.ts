import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { ZodError } from "zod";
import { createApp } from "./app.ts";
import { apiKeyRoutes } from "./app/routes/api-key.routes.ts";
import { env } from "./config/env.ts";
import { HttpError } from "./common/http-error.ts";
import { paymentRoutes } from "./app/routes/payment.routes.ts";
import { webhookEndpointRoutes } from "./app/routes/webhook-endpoint.routes.ts";
import { paymentEventRoutes } from "./app/routes/payment-event.routes.ts";
import { webhookDeliveryRoutes } from "./app/routes/webhook-delivery.routes.ts";
import { checkoutRoutes } from "./app/routes/checkout.routes.ts";
import { subcriptionRoutes } from "./app/routes/subscription.routes.ts";
import { virtualClockRoutes } from "./app/routes/virtual-clock.routes.ts";
import { virtualClockService } from "./app/services/virtual-clock.service.ts";
import { registerSwagger } from "./config/swagger.ts";
import { registerScheduler } from "./config/scheduler.ts";

export const appSingleton = createApp();

// Swagger documentation
await registerSwagger(appSingleton);

// CORS
appSingleton.register(cors, {
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  origin: env.WEB_URL,
});

// Errors
appSingleton.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "BAD_REQUEST",
      code: 400,
      message: error.issues.map((issue) => issue.message),
    });
  }

  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      error: error.error,
      code: error.statusCode,
      message: error.message,
    });
  }

  request.log.error(error);

  return reply.status(500).send({
    statusCode: 500,
    error: "INTERNAL_SERVER_ERROR",
    message: "Unexpected error",
  });
});

// Mock Webhook Handler
appSingleton.post("/webhooks/mock/handler", async (request, reply) => {
  console.log("Webhook received");
  console.log("Body:", request.body);
  console.log("Signature:", request.headers["x-signature"]);
  return reply.status(200).send();
});

// Routes
appSingleton.register(apiKeyRoutes, { prefix: "/api-keys" });
appSingleton.register(paymentRoutes, { prefix: "/payments" });
appSingleton.register(webhookEndpointRoutes, { prefix: "/webhooks/endpoints" });
appSingleton.register(webhookDeliveryRoutes, {
  prefix: "/webhooks/deliveries",
});
appSingleton.register(paymentEventRoutes, { prefix: "/events" });
appSingleton.register(checkoutRoutes, { prefix: "/checkouts" });
appSingleton.register(subcriptionRoutes, { prefix: "/subscriptions" });
appSingleton.register(virtualClockRoutes, { prefix: "/virtual-clock" });

// Scheduler
await registerScheduler(appSingleton);

try {
  await virtualClockService.initialize();
  await appSingleton.listen({
    host: "0.0.0.0",
    port: env.PORT,
  });
} catch (error) {
  appSingleton.log.error(error);
  process.exit(1);
}
