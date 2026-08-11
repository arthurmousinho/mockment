![Banner](./.github/banner.png)

# Mockment

> A local-first fake payment gateway for developing and testing payment integrations.

Mockment is a personal learning project created as a way to explore the concepts, business rules, and engineering challenges involved in payment systems.

The project **simulates** the behavior of a payment gateway, allowing developers to build and test payment integrations without relying on external providers, internet connectivity, or sandbox environments.

Inspired by tools like Mailcatcher, Mockment aims to provide a predictable and fully local environment for simulating payment flows, webhooks, subscriptions, and other scenarios commonly found in payment systems.

The project is intentionally focused on simplicity, both in its features and architecture, while exploring how real-world payment concepts can be modeled and reproduced in a local development environment.

<p align="left">
  <a href="#motivation">
    <img src="./.github/motivation-button.png" alt="Motivation" width="260">
  </a>
  <a href="#project-status">
    <img src="./.github/project-status-button.png" alt="Project Status" width="260">
  </a>
  <a href="#tech-stack">
    <img src="./.github/tech-stack-button.png" alt="Tech Stack" width="260">
  </a>
  <a href="#architecture">
    <img src="./.github/architecture-button.png" alt="Architecture" width="260">
  </a>
  <a href="#installation">
    <img src="./.github/installation-button.png" alt="Installation" width="260">
  </a>
  <a href="#quick-start">
    <img src="./.github/quick-start-button.png" alt="Quick Start" width="260">
  </a>
</p>

## Motivation

Integrating with payment providers during development can be slow and frustrating.

- Requires API keys
- Depends on internet connectivity
- Sandbox environments are often unstable
- Different providers expose different APIs
- Difficult to reproduce edge cases

Mockment solves these problems by providing a local payment gateway that behaves like a real one.

## Project Status

> **⚠️ Mockment is under development.**

The project is functional but still evolving. Core features are being implemented incrementally, and breaking changes may occur until the first stable release.

| Feature            | Status |
| ------------------ | :----: |
| API Keys           |   ✅   |
| Payment API        |   🚧   |
| Payment Simulation |   🚧   |
| Webhooks           |   ✅   |
| Event Store        |   ✅   |
| Dashboard          |   🚧   |
| Refunds            |   📋   |
| Documentation      |   🚧   |
| CI/CD              |   📋   |

✅ **Implemented** | 🚧 **In Progress** | 📋 **Planned**

## Architecture

![Architecture](./.github/architecture.png)

Mockment is designed to fit into your existing application like a real payment provider. Instead of communicating with Stripe, Mercado Pago, Adyen, or another external gateway, your backend sends payment requests to a local Mockment instance.

The flow is straightforward:

1. The user initiates a payment from your application.
2. Your frontend sends the request to your backend.
3. Your backend calls the Mockment REST API.
4. Mockment simulates the payment lifecycle and stores the transaction locally.
5. If configured, Mockment sends webhook events back to your application, allowing you to test asynchronous payment flows exactly as they would happen in production.

Because everything runs locally, developers can build, debug, and reproduce payment scenarios without internet connectivity, sandbox accounts, or third-party dependencies.

## Tech Stack

![mockment-banner](./.github/tech-stack.png)

| Technology       | Why it's used                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **React**        | Powers the dashboard used to manage API keys, inspect payments, configure webhooks, and monitor simulated transactions. |
| **Tailwind CSS** | Utility-first CSS framework used to build a modern, responsive, and maintainable interface.                             |
| **shadcn/ui**    | Provides accessible, reusable UI components built on Radix UI, enabling a consistent developer experience.              |
| **Node.js**      | JavaScript runtime that powers the Mockment backend and its high-performance REST API.                                  |
| **Fastify**      | Fast and lightweight web framework responsible for routing, validation, plugins, and HTTP handling.                     |
| **Zod**          | Runtime schema validation and TypeScript type inference for requests, responses, configuration and UI forms.            |
| **Docker**       | Makes Mockment easy to run locally with a consistent environment across operating systems.                              |
| **Prisma ORM**   | Type-safe ORM used for database access, migrations, and data modeling.                                                  |
| **MySQL**        | Stores payments, API keys, webhook configurations, events, and other persistent application data.                       |

## Installation

Before getting started, make sure you have the following installed:

- **Node.js** 22 or later
- **pnpm** 10+
- **Docker** and Docker Compose
- **Git**

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/arthurmousinho/mockment.git
cd mockment
```

Install all workspace dependencies:

```bash
pnpm install
```

Mockment uses MySQL running inside Docker. Start the required containers before running the application:

```bash
docker compose up -d
```

Create your local environment configuration by copying the example file:

```bash
cp .env.example .env
```

The default configuration should work for most development environments, but you can adjust the variables if necessary.

Next, create the database schema using Prisma migrations:

```bash
pnpm prisma migrate dev
```

Finally, start the development environment:

```bash
pnpm dev
```

After everything is running, the services will be available at:

| Service       | URL                   |
| ------------- | --------------------- |
| REST API      | http://localhost:8080 |
| Web Dashboard | http://localhost:4200 |

## Quick Start

Once Mockment is running, you're ready to start simulating payment flows.

The first step is creating a mock API key. Every request to the Mockment API must be authenticated using an API key, just like a real payment provider.

```bash
curl -X POST http://localhost:8080/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my first api key"
  }'
```

The response contains a `rawKey`. Keep this value safe, as it is the only time it will be returned and it will be required to authenticate future requests. Next, register a webhook endpoint. Mockment will send payment events to this URL whenever a payment changes state. Replace `<YOUR_API_KEY>` with the `rawKey` from the previous step.

```bash
curl -X POST http://localhost:8080/webhooks/endpoints \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/api/webhooks/payments",
    "events": [
      "PAYMENT_CREATED",
      "PAYMENT_PROCESSING",
      "PAYMENT_APPROVED",
      "PAYMENT_DECLINED",
      "PAYMENT_CANCELED"
    ]
  }'
```

With a webhook configured, you can now create your first mock payment.

```bash
curl -X POST http://localhost:8080/payments \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "amountInCents": 500,
    "currency": "BRL",
    "method": "PIX",
    "description": "Order 123",
    "externalId": "39ef8b2b-fb64-41ac-8ba4-989b36f47b80",
    "idempotencyKey": "2da31f0f-e4db-4bb9-87dd-6b41ce22a448"
  }'
```

If the request succeeds, Mockment will create a new payment and return its details, including the payment identifier and current status. As the payment lifecycle progresses, Mockment will automatically deliver the configured webhook events to your application, allowing you to test your integration exactly as you would with a real payment gateway.
