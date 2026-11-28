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
  const { __editor, ...savedInput } = saved.input ?? {};
  const metadata =
    __editor === undefined ? undefined : metadataSchema.parse(__editor);
  const { input, connections } = definition.migrateInput?.(
    savedInput,
    metadata?.connections ?? [],
  ) ?? { input: savedInput, connections: metadata?.connections ?? [] };

  for (const connection of connections) {
    if (connection.target !== metadata?.nodeId) {
      throw new Error("Invalid connection target.");
    }
    const output = context.outputs.get(connection.source);
    const name = connection.sourceHandle.slice("output:".length);
    if (!output || !Object.hasOwn(output, name)) {
      throw new Error(`Connected output ${name} is unavailable.`);
    }
    const field = connection.targetHandle.slice("input:".length);
    const arrayHandle = /^([^:]+):(0|[1-9]\d*)$/.exec(field);
    if (arrayHandle) {
      const arrayField = arrayHandle[1]!;
      const values = input[arrayField];
      const index = Number(arrayHandle[2]);
      if (
        definition.input.find((candidate) => candidate.name === arrayField)
          ?.type !== "string[]" ||
        !Array.isArray(values) ||
        index >= values.length
      )
        throw new Error(`Unknown input: ${field}`);
      const updated = [...values];
      updated[index] = output[name];
      input[arrayField] = updated;
      continue;
    }
    const objectHandle = /^([^:]+):(0|[1-9]\d*):([^:]+)$/.exec(field);
    if (objectHandle) {
      const arrayField = objectHandle[1]!;
      const nestedField = objectHandle[3]!;
      const definitionField = definition.input.find(
        (candidate) => candidate.name === arrayField,
      );
      const values = input[arrayField];
      const index = Number(objectHandle[2]);
      const item = Array.isArray(values) ? values[index] : undefined;
      if (
        definitionField?.type !== "object[]" ||
        !definitionField.fields?.some(
          (candidate) => candidate.name === nestedField,
        ) ||
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        throw new Error(`Unknown input: ${field}`);
      }
      const updated = [...(values as unknown[])];
      updated[index] = { ...item, [nestedField]: output[name] };
      input[arrayField] = updated;
      continue;
    }
    if (!definition.input.some((candidate) => candidate.name === field)) {
      throw new Error(`Unknown input: ${field}`);
    }
    input[field] = output[name];
  }

  return { input, nodeId: metadata?.nodeId };
}

function validateInput(input: StepInput, definition: Step) {
  function validateFields(input: StepInput, fields: Step["input"]) {
    for (const field of fields) {
      const value = input[field.name];
      if (value === undefined || value === "") {
        if (field.required) {
          throw new Error(`Missing input: ${field.name}`);
        }
        continue;
      }

      if (field.type === "object[]") {
        if (
          !Array.isArray(value) ||
          (field.required && !value.length) ||
          !field.fields
        )
          throw new Error(`Invalid input: ${field.name}`);
        for (const item of value) {
          if (!item || typeof item !== "object" || Array.isArray(item))
            throw new Error(`Invalid input: ${field.name}`);
          validateFields(item, field.fields);
        }
        continue;
      }
      if (field.type === "string[]") {
        if (
          !Array.isArray(value) ||
          (field.required && !value.length) ||
          value.some(
            (item) =>
              typeof item !== "string" ||
              !item.trim() ||
              (field.options && !field.options.includes(item)),
          )
        )
          throw new Error(`Invalid input: ${field.name}`);
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
  validateFields(input, definition.input);
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
    action === "invoice.create" ||
    action === "checkout.createStandalone" ||
    action === "checkout.createSubscription" ||
    action === "checkout.createProducts";
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
