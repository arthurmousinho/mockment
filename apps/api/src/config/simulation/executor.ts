import { setTimeout } from "node:timers/promises";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma } from "../../../generated/prisma/client.ts";
import { API_PREFIX } from "../env.ts";
import { prismaSingleton } from "../prisma.ts";
import { createPrefixedId } from "../../common/utils.ts";
import { simulationScenarioStepSchema } from "../../app/schemas/simulation.schema.ts";
import { apiKeyService } from "../../app/services/api-key.service.ts";
import { notifyRunUpdated } from "./run-events.ts";
import { STEPS } from "./steps.ts";
import type { Step, StepHTTPExecutor } from "./types.ts";

const metadataSchema = z.object({
  nodeId: z.string(),
  connections: z.array(
    z.object({
      source: z.string(),
      sourceHandle: z.string().startsWith("output:"),
      target: z.string(),
      targetHandle: z.string().startsWith("input:"),
    }),
  ),
});

const definitions: readonly Step[] = Object.values(STEPS).flat();

type SavedStep = z.infer<typeof simulationScenarioStepSchema>;
type StepInput = Record<string, unknown>;
type ExecutionContext = {
  app: FastifyInstance;
  runId: string;
  outputs: Map<string, Record<string, unknown>>;
  authorization: string | undefined;
  temporaryKeyId: string | undefined;
  activeStepId: string | undefined;
};

function findDefinition(action: string) {
  const definition = definitions.find((step) => step.id === action);
  if (!definition) {
    throw new Error(`Unknown step: ${action}`);
  }
  return definition;
}

function resolveInput(
  saved: SavedStep,
  definition: Step,
  context: ExecutionContext,
) {
  const { __editor, ...input } = saved.input ?? {};
  const metadata =
    __editor === undefined ? undefined : metadataSchema.parse(__editor);

  for (const connection of metadata?.connections ?? []) {
    if (connection.target !== metadata?.nodeId) {
      throw new Error("Invalid connection target.");
    }
    const output = context.outputs.get(connection.source);
    const name = connection.sourceHandle.slice("output:".length);
    if (!output || !Object.hasOwn(output, name)) {
      throw new Error(`Connected output ${name} is unavailable.`);
    }
    const field = connection.targetHandle.slice("input:".length);
    if (!definition.input.some((candidate) => candidate.name === field)) {
      throw new Error(`Unknown input: ${field}`);
    }
    input[field] = output[name];
  }

  return { input, nodeId: metadata?.nodeId };
}

function validateInput(input: StepInput, definition: Step) {
  for (const field of definition.input) {
    const value = input[field.name];
    if (value === undefined || value === "") {
      if (field.required) {
        throw new Error(`Missing input: ${field.name}`);
      }
      continue;
    }

    const expectedType = field.type === "select" ? "string" : field.type;
    const invalidType = typeof value !== expectedType;
    const invalidNumber = field.type === "number" && !Number.isFinite(value);
    const invalidOption =
      field.type === "select" && !field.options?.includes(value as string);
    if (invalidType || invalidNumber || invalidOption) {
      throw new Error(`Invalid input: ${field.name}`);
    }
  }
}

function buildRequest(executor: StepHTTPExecutor, input: StepInput) {
  const payload = { ...input };
  const url = executor.endpoint.replace(/:([a-zA-Z]+)/g, (_, name: string) => {
    const value = payload[name];
    delete payload[name];
    return encodeURIComponent(String(value));
  });
  const hasPayload =
    executor.method !== "GET" && Object.keys(payload).length > 0;

  return {
    method: executor.method,
    url: `${API_PREFIX}${url}`,
    ...(hasPayload ? { payload } : {}),
  };
}

async function ensureAuthorization(context: ExecutionContext, action: string) {
  const requiresKey =
    action === "payment.create" ||
    action === "subscription.create" ||
    action === "invoice.create";
  if (context.authorization || !requiresKey) {
    return;
  }

  const key = await apiKeyService.create({
    name: `Simulation ${context.runId}`,
  });
  context.temporaryKeyId = key.id;
  context.authorization = `Bearer ${key.rawKey}`;
}

async function executeRequest(
  context: ExecutionContext,
  definition: Step,
  input: StepInput,
) {
  if (definition.executor.type !== "http") {
    throw new Error("Unsupported step executor.");
  }

  await ensureAuthorization(context, definition.id);
  const response = await context.app.inject({
    ...buildRequest(definition.executor, input),
    headers: context.authorization
      ? { authorization: context.authorization }
      : {},
  });
  if (response.statusCode >= 400) {
    throw new Error(
      `Step request failed (${response.statusCode}): ${response.body}`,
    );
  }

  return response.body ? response.json() : null;
}

async function startRun(runId: string, steps: SavedStep[]) {
  await prismaSingleton.simulationRun.update({
    where: { id: runId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      steps: {
        create: steps.map((step, stepIndex) => ({
          id: createPrefixedId("stp"),
          name: step.name,
          stepIndex,
          status: "PENDING",
        })),
      },
    },
  });
}

async function executeStep(
  context: ExecutionContext,
  saved: SavedStep,
  index: number,
) {
  const record = await prismaSingleton.simulationStepRun.update({
    where: { runId_stepIndex: { runId: context.runId, stepIndex: index } },
    data: { status: "RUNNING", startedAt: new Date() },
  });
  context.activeStepId = record.id;
  notifyRunUpdated(context.runId);

  const definition = findDefinition(saved.action);
  const { input, nodeId } = resolveInput(saved, definition, context);
  await prismaSingleton.simulationStepRun.update({
    where: { id: record.id },
    data: { input: input as Prisma.InputJsonObject },
  });
  notifyRunUpdated(context.runId);
  validateInput(input, definition);

  const output = await executeRequest(context, definition, input);
  context.outputs.set(nodeId ?? `legacy-${index + 1}`, output ?? {});
  await prismaSingleton.simulationStepRun.update({
    where: { id: record.id },
    data: {
      status: "COMPLETED",
      output: output ?? Prisma.JsonNull,
      finishedAt: new Date(),
    },
  });
  context.activeStepId = undefined;
  await prismaSingleton.simulationRun.update({
    where: { id: context.runId },
    data: { currentStep: index + 1 },
  });
}

async function completeRun(runId: string) {
  await prismaSingleton.simulationRun.update({
    where: { id: runId },
    data: { status: "COMPLETED", finishedAt: new Date() },
  });
}

async function failRun(context: ExecutionContext, cause: unknown) {
  const error = {
    message:
      cause instanceof Error ? cause.message : "Simulation execution failed.",
  };
  if (context.activeStepId) {
    await prismaSingleton.simulationStepRun.update({
      where: { id: context.activeStepId },
      data: { status: "FAILED", error, finishedAt: new Date() },
    });
  }
  await prismaSingleton.simulationStepRun.updateMany({
    where: { runId: context.runId, status: "PENDING" },
    data: { status: "SKIPPED", finishedAt: new Date() },
  });
  await prismaSingleton.simulationRun.update({
    where: { id: context.runId },
    data: { status: "FAILED", error, finishedAt: new Date() },
  });
}

export async function executeSimulation(
  app: FastifyInstance,
  runId: string,
  savedSteps: Prisma.JsonValue,
  interval: number | null,
  authorization?: string,
) {
  const context: ExecutionContext = {
    app,
    runId,
    outputs: new Map(),
    authorization,
    temporaryKeyId: undefined,
    activeStepId: undefined,
  };

  try {
    const steps = z.array(simulationScenarioStepSchema).parse(savedSteps);
    await startRun(runId, steps);
    notifyRunUpdated(runId);

    for (const [index, saved] of steps.entries()) {
      if (index > 0 && interval) {
        await setTimeout(interval);
      }
      await executeStep(context, saved, index);
      notifyRunUpdated(runId);
    }

    await completeRun(runId);
    notifyRunUpdated(runId);
  } catch (cause) {
    await failRun(context, cause);
    notifyRunUpdated(runId);
  } finally {
    if (context.temporaryKeyId) {
      await apiKeyService.revoke(context.temporaryKeyId);
    }
  }
}
