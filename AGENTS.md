# Mockment Agent Guide

## Project Overview

Mockment is a local-first payment gateway simulator and learning project.
It models payments, checkouts, subscriptions, events, webhooks, virtual time,
and saved simulation scenarios. Favor the simplicity described in `CONTRIBUTING.md`.
This guide describes the current implementation, including gaps; it is not a roadmap.

## Repository Structure

- `pnpm-workspace.yaml` includes `apps/*`; use pnpm and the existing lockfile.
- `apps/api`: TypeScript ESM, Fastify, Zod, Prisma, and MySQL.
- `apps/web`: React, TypeScript, Vite, React Router, TanStack Query, and Tailwind CSS.
- `packages/` currently contains no files and is not included in the workspace glob.
- `scripts/dev.mjs` coordinates local startup; `docker-compose.yml` provides MySQL.
- `.github/` currently contains documentation images, with no CI workflows.

## General Development Rules

- Read a comparable implementation and its callers before writing code.
- Make small, focused changes that satisfy the task; do not refactor unrelated code.
- Reuse existing helpers, schemas, services, components, and dependencies.
- Avoid speculative abstractions, new layers, shared packages, and unnecessary dependencies.
- Preserve existing API contracts, stored scenario formats, and unrelated local changes.
- Follow the surrounding file's style rather than reformatting whole modules.
- Source filenames generally use kebab-case; functions and variables use camelCase.
- Types and React components use PascalCase; constants such as `STEPS` use uppercase.
- Both apps enable strict TypeScript and `verbatimModuleSyntax`; use type-only imports.
- Object shapes commonly use `type` aliases, and backend inputs use `z.infer`.
- Most source uses double quotes, semicolons, two-space indentation, and named exports.
- Import order is not uniform; there is no repository-wide import sorting convention.

## Backend Conventions

### Structure and responsibilities

- `apps/api/src/app.ts` creates the Fastify instance and root health route.
- `apps/api/src/server.ts` configures errors, CORS, Swagger, route prefixes,
  the scheduler, virtual clock initialization, and the listening server.
- `src/config/` holds infrastructure singletons and configuration.
- `src/common/` holds HTTP errors, pagination, search, OpenAPI, and ID helpers.
- `src/app/routes/*.routes.ts` exports async Fastify registration functions.
- Routes parse request data, call services, and send explicit HTTP responses.
- `src/app/services/*.service.ts` owns business rules, persistence, and orchestration.
- Services usually define module-local functions and export an object such as `paymentService`.
- There are no controller or repository layers; services access Prisma directly.
- `src/app/schemas/*.schema.ts` defines Zod request/response schemas and inferred types.
- `src/app/docs/*.docs.ts` defines endpoint documentation attached through `{ schema: ... }`.
- `src/app/filters/*.filters.ts` builds typed Prisma search conditions.
- `src/app/jobs/` contains scheduled tasks registered through `src/config/scheduler.ts`.
- Backend relative imports include `.ts`, including generated Prisma imports.
- Examples: `payment.routes.ts`, `payment.service.ts`, and `payment.schema.ts`
  under their respective `apps/api/src/app/` directories.

### Validation, errors, and contracts

- Parse bodies and queries with Zod at route boundaries; path IDs are often type assertions.
- Reuse `src/common/search.schema.ts` and `pagination.schema.ts` for listing inputs.
- Keep response documentation aligned using helpers in `src/common/openapi.ts`.
- Reuse `BadRequestError`, `NotFoundError`, `ConflictError`, and `UnauthorizedError`
  from `src/common/http-error.ts` for the corresponding business failures.
- `server.ts` maps Zod errors to 400 and `HttpError` to its declared status.
- Unexpected errors are logged and returned as a generic 500 response.
- Error contracts differ: Zod messages are arrays, HTTP error messages are strings,
  and unexpected errors use `statusCode` instead of `code`.
- Some existing services throw plain `Error` for business failures, for example
  `checkout.service.ts`; do not silently normalize unrelated error behavior.
- Authentication is handled explicitly by relevant routes/services, rather than
  a global authentication hook; inspect the specific endpoint before changing it.
- `api-key.service.ts` hashes raw keys with SHA-256 and omits hashes from listings.
- Environment values are validated centrally in `src/config/env.ts`.

### Existing business flow

- Reuse service methods to preserve status transitions and side effects.
- `checkout.service.ts` delegates payment transitions and subscription activation.
- `event.service.ts` persists events and invokes `webhookDeliveryService.dispatch`.
- `webhook-delivery.service.ts` signs payloads with HMAC and records delivery outcomes.
- Virtual-time operations live in `virtual-clock.service.ts`; inspect it and
  `subscription.service.ts` before changing recurring billing behavior.
- The tick job advances virtual time and processes due subscriptions using toad-scheduler.

## Database Conventions

- Source of truth: `apps/api/prisma/schema.prisma`; migrations live in timestamped folders.
- Prisma uses MySQL and generates into ignored `apps/api/generated/prisma`.
- Import the existing `prismaSingleton` from `src/config/prisma.ts`; it uses PrismaMariaDb.
- Reuse generated models, enums, and Prisma filter types rather than duplicating them.
- Models use PascalCase and fields use camelCase; table names use `@@map` with snake_case.
- Many columns use `@map` with snake_case, but this is not uniform across all models.
- IDs are generally explicit strings from `createPrefixedId` in `src/common/utils.ts`
  (examples: `aky`, `pay`, `chk`, `scn`); `VirtualClock` uses the fixed ID `default`.
- Models commonly have `createdAt @default(now())` and `updatedAt @updatedAt`.
- Lists generally query rows and count with `Promise.all`, ordered newest first.
- Reuse `buildPrismaPaginationParams` and `buildPaginatedResponse` for the response envelope.
- Search filters reuse `buildSearchFilter`; see `src/app/filters/payment.filters.ts`.
- JSON fields represent values such as event payloads, webhook event lists, and scenario steps.
- `simulation-scenario.service.ts` casts saved steps to `Prisma.InputJsonArray`.
- Prisma error translation is local where implemented: scenario deletion maps P2025
  to not found and P2003 to conflict. There is no universal database error mapper.

## Frontend Conventions

- `src/main.tsx` installs StrictMode, QueryClientProvider, and RouterProvider.
- `src/lib/router.tsx` defines routes, nested layouts, and page title handles.
- `src/pages/` contains page components; `src/layouts/` provides route layouts.
- `src/components/` holds domain dialogs, badges, and reusable listing controls.
- `src/components/ui/` contains existing shadcn/Radix-style primitives.
- Reuse those primitives, Tailwind theme classes, Phosphor icons, and `cn` from `src/lib/utils.ts`.
- `src/http/*-http.ts` holds request/response types and TanStack Query wrappers.
- Use `api` from `src/lib/ky.ts`, configured with `VITE_API_URL`, for API requests.
- Existing request wrappers use PascalCase names such as `FindAllPaymentsRequest`
  even though they call hooks. Ordinary custom hooks in `src/hooks/` use `use...` names.
- Query keys include the resource and parameters; paginated queries use `keepPreviousData`.
- Mutations commonly invalidate resource queries, show Sonner success toasts,
  and delegate failures to `apiErrorHandler`.
- Keep server state in TanStack Query and local UI state in React state/hooks.
- Forms commonly use React Hook Form with `zodResolver` and local inferred schemas;
  see `src/components/api-key-form-dialog.tsx`.
- This is not universal: the simulation editor uses local React/React Flow state.
- Listing pages handle loading, errors, empty results, search, and pagination;
  reuse `ListingSearch`, `Paginator`, and `RefetchButton` as in `src/pages/payments.tsx`.
- Frontend imports commonly use `@/` for `src`, with extensionless relative imports too.
- Frontend HTTP types are maintained locally; they are not generated from Prisma.
- `src/types/http.type.ts` defines pagination and errors, but its `message: string[]`
  does not cover every backend error; `apiErrorHandler` accepts strings and arrays.

## Simulation Module Conventions

- Backend definitions live in `apps/api/src/app/simulation/steps/*.steps.ts`.
- Definitions use dotted IDs such as `payment.create`, `satisfies Step`, and grouped
  `as const` arrays collected in `simulation/steps.ts`.
- `simulation/types.ts` defines input/output fields and HTTP/wait executor types.
- Select options can reuse Zod enum options; see `steps/checkout.steps.ts`.
- `GET /simulation/steps` exposes grouped definitions without executor details;
  backend `description` is exposed as `desc`, and input/output fields are arrays.
- Scenarios store an ordered `steps` JSON array of `{ name, action, input? }`,
  with 1–100 steps; `action` refers to a definition ID. There are no top-level nodes/edges.
- React Flow nodes use type `step` and data `{ stepId, step, input }`.
- Handles are `input:<fieldName>` and `output:<fieldName>`; see `step-node.tsx`.
- `apps/web/src/lib/simulation-editor.ts` owns graph validation, restoration, and serialization.
- It normalizes definition field arrays into `{ fields }`, also accepting that envelope.
- Editor metadata is stored inside each saved step's `input.__editor`:
  `{ version: 1, nodeId, position: { x, y }, connections }`.
- Connections contain `source`, `sourceHandle`, `target`, and `targetHandle`,
  and are stored on the target step. Connected manual inputs are removed when saving.
- Serialization checks handles/types, one connection per input, required manual values,
  select options, and cycles, then saves dependencies before consumers.
- Select inputs accept string outputs. Legacy steps without metadata get `legacy-N` IDs.
- Preserve this format and its compatibility behavior when modifying simulation features.
- Prisma already defines `SimulationRun`, `SimulationStepRun`, and their status enums,
  but the current backend implements scenario CRUD and step discovery, not run execution.
- Backend scenario validation checks step structure; graph validation currently lives in the UI.

## Testing and Validation

- No automated test suite, test runner configuration, or CI validation workflow is present.
- Root `pnpm test` is a placeholder that exits with failure; the API has no test script.
- Existing commands, run from the repository root as appropriate to the change:
  - `pnpm --filter @mockment/api build` runs TypeScript checks.
  - `pnpm --filter web build` runs project TypeScript checks and the Vite build.
  - `pnpm --filter web lint` runs ESLint, including React Hooks and refresh rules.
  - `pnpm --filter web typecheck` exists, but uses the root web tsconfig;
    the build's `tsc -b` covers its referenced application/node projects.
- Web `format` runs Prettier over all TS/TSX files; avoid running it across unrelated files.
- There is no API lint/format script or root formatter configuration.
- API `build` has `noEmit: true`, while `start` expects `dist/server.js`; do not assume it emits.
- Existing API typecheck issues include a missing `payment-event.schema.ts` import in
  `payment-event.docs.ts` and a missing payment ID in `createRecurringPayment`.
  Recheck current output and report unrelated failures instead of repairing them incidentally.
- `pnpm dev` generates Prisma, runs `prisma migrate dev`, checks the virtual clock,
  and starts both apps; it is not a read-only validation command.

## Implementation Workflow

1. Inspect the closest existing module, relevant schemas, and both sides of changed contracts.
2. Reuse current layers and helpers; implement only the requested behavior.
3. For schema changes, follow `apps/api/prisma/migrations` and regenerate the client;
   do not edit generated files or apply database changes as incidental validation.
4. Run applicable existing checks and inspect the diff for unrelated changes.
5. Report the resulting behavior, validation performed, and any pre-existing blockers.

Avoid introducing controller/repository frameworks, global state libraries, shared packages,
or broad renaming/style cleanup merely to standardize inconsistencies documented here.
