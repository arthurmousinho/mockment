![Contributing](./.github/contributing.png)

# Contributing

First of all, thank you for considering contributing to Mockment! 💚

Mockment is an open-source **learning and experimentation project** designed to help developers understand payment gateway concepts by providing a local environment where they can build, test, and debug payment integrations without relying on external providers or unstable sandbox environments.

The goal of Mockment is **not to be a production-ready payment gateway or a highly usable alternative to real payment providers**. Instead, the project focuses on making payment concepts, workflows, and integrations easier to understand through practical experimentation.

Every contribution is appreciated, whether it is fixing a bug, improving the documentation, implementing a feature, or simply suggesting an idea.

## Project Philosophy

Mockment is designed primarily as a **learning tool**, with a few core principles:

- **Learning-first** — The project should make payment gateway concepts easier to understand and experiment with.
- **Local-first** — Everything should run entirely on the developer's machine whenever possible.
- **Developer Experience** — APIs and workflows should be simple, predictable, and easy to understand.
- **Realistic Enough** — Payment workflows should resemble real-world systems enough to be useful for learning, without trying to reproduce every complexity of a production payment provider.
- **Deterministic** — The same input should produce the same output whenever possible, making experiments easier to reproduce and understand.
- **Simplicity** — Prefer understandable implementations over production-grade complexity when the two conflict.
- **Open Source** — The project is built for learning and experimentation and welcomes contributions from the community.

### What Mockment Is Not

Mockment is **not intended to be used as a real payment gateway in production**.

It does not aim to replace providers such as Stripe, Adyen, Mercado Pago, or other payment platforms. Production payment systems involve security, compliance, reliability, fraud prevention, scalability, and many other concerns that are intentionally outside the scope of this project.

The purpose of Mockment is to provide a safe and understandable environment for developers to explore concepts such as:

- Payment creation and processing
- Payment states and transitions
- Webhooks
- Idempotency
- Payment methods
- Subscriptions
- API design
- Event-driven workflows
- Error handling
- Integration testing

When contributing, please keep the educational purpose of the project in mind.

A feature does not necessarily need to make Mockment more powerful or production-ready. **If it makes an important concept easier to understand, experiment with, or demonstrate, it can be valuable to the project.**

## Getting Started

To set up your local development environment, follow the instructions in the project's README.

See the **Installation** section:

> [README.md → Installation](./README.md#installation)

After the project is running, you can start implementing your changes.

## Ways to Contribute

There are many ways to contribute:

- Report bugs
- Improve the documentation
- Improve the dashboard UI
- Fix existing issues
- Add new payment simulations
- Implement new payment methods
- Improve webhook behavior
- Improve developer experience
- Refactor existing code
- Add automated tests
- Suggest new learning-oriented features
- Improve examples and demonstrations

Even small improvements make a difference.

## Before Opening an Issue

Before creating a new Issue, please:

- Search existing Issues to avoid duplicates.
- Make sure the behavior isn't already documented.
- Clearly explain the problem or feature request.
- Include as much context as possible.

Feature discussions are always welcome.

## Before Opening a Pull Request

Please make sure that:

- Your changes solve a single problem.
- The project builds successfully.
- Existing functionality continues to work.
- New code follows the existing architecture.
- Documentation has been updated when necessary.

Small and focused Pull Requests are much easier to review than very large ones.

## Coding Guidelines

Please follow the current coding style throughout the project.

### General

- Use TypeScript.
- Prefer explicit types.
- Keep functions small and focused.
- Avoid unnecessary abstractions.
- Write readable code before clever code.

### Validation

- Validate all external input using Zod.
- Never trust request payloads.

### Business Logic

- Keep business logic inside services.
- Controllers should only orchestrate requests and responses.
- Avoid mixing HTTP concerns with domain logic.

### Database

- Use Prisma for all database operations.
- Keep migrations small and descriptive.
- Prefer explicit relations over complex queries whenever possible.

### Commits

Use **Conventional Commits** whenever possible.

Examples:

```text
feat: add subscription simulation

fix: prevent duplicated webhook deliveries

docs: improve installation guide

refactor: simplify payment service
```

Reference:

https://www.conventionalcommits.org

## Code Style

Before submitting your Pull Request, make sure the project is properly formatted and linted.

Consistency is more important than personal preference.

## Testing

Whenever possible:

- Test your feature locally.
- Ensure existing behavior has not been broken.
- Add tests for new functionality whenever it makes sense.
- Prefer tests that demonstrate payment concepts and expected workflows.

## Documentation

Documentation is just as important as code.

If your Pull Request introduces:

- a new endpoint,
- a new feature,
- a new configuration,
- or changes existing behavior,

please update the relevant documentation.

Since Mockment is a learning-oriented project, documentation should also explain **why something works the way it does**, not only how to use it.

## Reporting Bugs

When reporting a bug, please include:

- Operating system
- Node.js version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Relevant logs
- Screenshots (if applicable)

The more information you provide, the easier it is to reproduce and fix the issue.

## Feature Requests

One of Mockment's goals is to help developers understand how payment systems work through practical experimentation.

When proposing a feature, consider whether it:

- helps explain an important payment concept;
- provides a useful learning experience;
- makes a workflow easier to understand;
- provides a realistic but simplified example;
- improves the developer experience.

A feature does not need to make Mockment more production-ready to be valuable.

In fact, **avoiding unnecessary production complexity is often a feature rather than a limitation**.

If you have an idea, open an Issue describing:

- the problem or concept you're trying to explore;
- your proposed solution;
- possible alternatives;
- why the feature would be useful for learning.

Discussion is encouraged before implementation.

## Questions

If you're unsure about an implementation or architectural decision, feel free to open a Discussion or an Issue before starting development.

We're happy to help.

## Thank You 💚

Open source only exists because people choose to contribute.

Whether you're fixing a typo, reporting a bug, improving documentation, or implementing a new learning experience, your contribution helps make Mockment a better resource for developers who want to understand payment systems.

Thank you for being part of the project. 🚀
