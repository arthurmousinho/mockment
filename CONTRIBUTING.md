# Contributing

First of all, thank you for your interest in Mockment! 💚

Mockment is a **learning and experimentation project** created to explore the concepts, business rules, and engineering challenges involved in payment systems.

The goal is to build a simple, local-first payment gateway simulator that makes it possible to experiment with payment flows, webhooks, subscriptions, checkout, and other concepts without depending on a real payment provider or sandbox environment.

## Current Project Stage

Mockment is currently being developed primarily as a **personal learning project and proof of concept**.

At this stage, the main goal is to understand the payment domain, experiment with different approaches, and validate the core ideas behind the project.

Because of this, **the project is not currently accepting direct code contributions or Pull Requests as part of its normal development process**.

This is intentional.

I want to first develop the core concepts, make architectural decisions, and understand the domain before opening the project to broader code contributions.

### What You Can Contribute Right Now

Although direct code contributions are not currently part of the project workflow, feedback and discussion are very welcome.

You can contribute by:

- Reporting bugs or unexpected behavior.
- Suggesting realistic payment scenarios.
- Sharing experiences with payment systems.
- Suggesting edge cases that should be simulated.
- Discussing architectural ideas.
- Suggesting improvements to the developer experience.
- Pointing out concepts that could be better represented.
- Improving the understanding of real-world payment workflows.

If you have experience working with payment systems, your perspective is especially valuable.

For example, a useful contribution could be describing a scenario such as:

> "In a real payment system, this can happen when..."

These real-world scenarios can help guide the development of the simulator.

## Project Philosophy

Mockment is primarily a **learning tool**, with a few core principles:

- **Learning-first** — The project exists to explore and understand payment systems.
- **Local-first** — Everything should run locally whenever possible.
- **Simplicity** — Prefer understandable implementations over unnecessary complexity.
- **Deterministic** — Simulations should be predictable and reproducible whenever possible.
- **Realistic enough** — Payment workflows should resemble real-world systems without attempting to reproduce every complexity of a production gateway.
- **Developer-focused** — APIs and workflows should be simple and easy to experiment with.
- **Open source** — The project is public so others can learn from it, experiment with it, and provide feedback.

## What Mockment Is Not

Mockment is **not intended to be a production-ready payment gateway**.

It does not aim to replace providers such as Stripe, Adyen, Mercado Pago, Pagar.me, or other payment platforms.

Production payment systems involve many concerns that are intentionally outside the scope of this project, including:

- Security
- PCI compliance
- Fraud prevention
- High availability
- Scalability
- Regulatory requirements
- Real payment processing
- Financial reconciliation
- Production-grade reliability

The purpose of Mockment is to provide a safe and understandable environment for learning and experimentation.

## What the Project Is Exploring

Some of the concepts currently being explored include:

- Payment creation and processing
- Payment states and transitions
- Checkout flows
- Webhooks
- Webhook failures and retries
- Idempotency
- Payment methods
- Subscriptions
- Recurring payments
- Virtual time
- Event-driven workflows
- Error handling
- Integration testing
- API design

The list is intentionally not exhaustive.

One of the goals of the project is to discover which payment scenarios are difficult to reproduce during normal development and find simple ways to simulate them locally.

## Suggesting a Scenario

If you have an idea for a payment scenario that Mockment should simulate, opening an Issue is one of the best ways to contribute.

A useful suggestion might include:

- What happens in the scenario?
- Why does it happen in a real payment system?
- What should the application receiving the payment need to handle?
- Why is the scenario difficult to reproduce locally?
- How could Mockment simulate it?

For example:

```text
A subscription renewal fails.

The payment provider creates a new payment,
the payment is declined, and a webhook is sent
to the merchant application.

The subscription should remain active/pending
according to the provider's behavior.
```

These kinds of scenarios are particularly valuable because they help connect the implementation with real-world payment behavior.

## Getting Started

You can still run the project locally and experiment with the current implementation.

Follow the installation instructions in the main README:

[README.md → Installation](./README.md#installation)

You are also encouraged to explore the codebase and experiment with the API locally.

## Future Contributions

The contribution model may change as the project evolves.

Once the core concepts have been explored and the proof of concept reaches a more mature stage, the project may open Pull Requests and direct code contributions to the community.

If that happens, this document will be updated with the appropriate development workflow, coding guidelines, testing requirements, and Pull Request process.

Until then, the focus remains on **learning, experimentation, and validating the ideas behind Mockment**.

## Project Continuity

Mockment is a personal learning project, so its long-term maintenance is not guaranteed.

The project may eventually be paused, become inactive, or reach a natural stopping point.

That does not necessarily mean the project has failed.

Since Mockment is primarily intended for learning and experimentation, reaching a point where the main concepts have been explored is a valid outcome.

If the project becomes inactive, the repository may remain available as a learning resource.

## Thank You 💚

Thank you for taking the time to explore Mockment.

Whether you report a bug, share a real-world payment scenario, suggest an idea, or simply experiment with the project, your feedback can help make the proof of concept better.

The goal is not to build another payment provider.

The goal is to **understand how payment systems work by building one**.

Thank you for being part of that journey. 🚀
