![Banner](./.github/banner.png)

# Mockment

> A local-first fake payment gateway for developing and testing payment integrations.

Mockment is a personal learning and experimentation project created to explore the concepts, business rules, and engineering challenges involved in payment systems.

The project simulates the behavior of a payment gateway, providing a local environment where payment flows, webhooks, subscriptions, and other payment scenarios can be explored and tested without relying on external providers, internet connectivity, or sandbox environments.

Inspired by tools like Mailcatcher, Mockment aims to provide a predictable and fully local environment for experimenting with payment integrations.

The primary purpose of Mockment is to learn about the payment domain by building a simplified payment gateway from scratch. It is not intended to be a production-ready payment provider or a replacement for real payment gateways.

The project is intentionally focused on simplicity, both in its features and architecture, while exploring how real-world payment concepts can be modeled and reproduced in a local development environment.

At its current stage, Mockment is primarily a proof of concept. The architecture, APIs, and features may change significantly as the project evolves and as new concepts from the payment domain are explored.

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

> **Mockment is a learning project and proof of concept.**

The project is actively being developed as a way to study and experiment with payment gateway concepts.

The current implementation is not intended to be a stable release or a production-ready tool. Features, APIs, database models, and architectural decisions may change as new ideas are explored.

The current implementation includes:

- API keys and payment creation, including idempotency and simulated status transitions, refunds, and checkout links.
- Customers, invoices, subscriptions, recurring payments, and a virtual clock for exploring billing over time.
- Events and signed webhook deliveries, with endpoint configuration and delivery history.
- A dashboard for inspecting and managing resources.
- A visual scenario editor, saved scenarios, and simulation runs with step results and live updates.
- Swagger and Scalar API documentation.

These features are still evolving and do not represent the full behavior or reliability of a production payment provider. There is currently no automated test suite or CI workflow.

At this point, the project is not actively accepting direct code contributions. The main goal is to first explore the payment domain, validate the core concepts, and build the proof of concept.

Feedback, ideas, real-world payment scenarios, and discussions are very welcome. If you have experience with payment systems and know of scenarios that are difficult to reproduce during development, sharing them can be especially valuable for the project.

The contribution model may change in the future as the project reaches a more mature stage.

## Architecture

![Architecture](./.github/architecture.png)

Mockment is designed to fit into your existing application like a real payment provider. Instead of communicating with Stripe, Mercado Pago, Adyen, or another external gateway, your backend sends payment requests to a local Mockment instance.

The flow is straightforward:

1. The user initiates a payment from your application.
2. Your frontend sends the request to your backend.
3. Your backend calls the Mockment REST API.
4. Mockment simulates the payment lifecycle and stores the transaction locally.
5. If configured, Mockment sends webhook events back to your application, allowing you to explore asynchronous payment flows locally.

Once dependencies and the database image are available locally, developers can experiment without a payment provider or sandbox account. Webhook delivery requires a reachable endpoint.

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

Configuration is stored in `apps/api/.env` and `apps/web/.env.local`. `pnpm dev` creates these files from the corresponding `.env.example` files if they do not already exist. You can also copy and edit them yourself before starting:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Install all workspace dependencies:

```bash
pnpm install
```

Mockment uses MySQL running inside Docker. Start the required containers before running the application:

```bash
docker compose up -d
```

The example configuration uses the MySQL container on port 3306. Adjust the app environment files if your local setup differs.

Finally, start the development environment:

```bash
pnpm dev
```

`pnpm dev` generates the Prisma client, runs development migrations, checks the virtual clock, and starts the API and web app. After startup, the default URLs are:

| Service           | URL                                  |
| ----------------- | ------------------------------------ |
| REST API          | http://localhost:8080/api/v1         |
| API Doc (Swagger) | http://localhost:8080/api/v1/docs     |
| API Doc (Scalar)  | http://localhost:4200/scalar-api-doc |
| Web Dashboard     | http://localhost:4200                |

## Quick Start

Once Mockment is running, you're ready to start simulating payment flows.

> Note: Mockment is currently a learning project and proof of concept. The API and behavior may change as the project evolves.

First, create a mock API key. Some endpoints, including payment and webhook endpoint creation, require it as a Bearer token; authentication is not applied globally to every route.

```bash
curl -X POST http://localhost:8080/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my first api key"
  }'
```

The response contains a `rawKey`. Keep this value safe, as it is the only time it will be returned and it will be required to authenticate future requests. Optionally, register a reachable webhook endpoint. Mockment will send the selected events to this URL when they are emitted. Replace `<YOUR_API_KEY>` with the `rawKey` from the previous step.

```bash
curl -X POST http://localhost:8080/api/v1/webhooks/endpoints \
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

Create your first mock payment:

```bash
curl -X POST http://localhost:8080/api/v1/payments \
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

The response includes the payment ID, its `CREATED` status, and a checkout link. Open the checkout link to explore the payment flow, or simulate transitions through the API. For example, replace `<PAYMENT_ID>` with the returned ID:

```bash
curl -X PATCH "http://localhost:8080/api/v1/payments/<PAYMENT_ID>/process"
curl -X PATCH "http://localhost:8080/api/v1/payments/<PAYMENT_ID>/approve"
```

Status transitions emit events and trigger deliveries to enabled endpoints subscribed to those events. You can inspect payments, events, and deliveries in the dashboard. See the API documentation for the available operations and their inputs.

## Development checks

```bash
pnpm --filter @mockment/api build
pnpm --filter web build
pnpm --filter web lint
```

The API build runs TypeScript checks without emitting a production build. The root `pnpm test` command is a failing placeholder; there is no automated test suite yet.
