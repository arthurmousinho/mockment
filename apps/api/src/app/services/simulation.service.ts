import type { FastifyInstance } from "fastify";
import { executeSimulation } from "../../config/simulation/executor.ts";
import { Prisma } from "../../../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../../common/http-error.ts";
import type { PaginationInput } from "../../common/pagination.schema.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
  createPrefixedId,
} from "../../common/utils.ts";
import type {
  CreateSimulationScenarioInput,
  SimulationScenarioListInput,
  UpdateSimulationScenarioInput,
} from "../schemas/simulation.schema.ts";
import { buildSimulationScenarioSearchFilter } from "../filters/simulation-scenario.filters.ts";
import { STEPS } from "../../config/simulation/steps.ts";
import type { Step } from "../../config/simulation/types.ts";

function availableSteps() {
  function mapSteps(steps: readonly Step[]) {
    return steps.map(({ id, name, description, input, output }) => ({
      id,
      name,
      desc: description,
      input,
      output,
    }));
  }

  return {
    payments: mapSteps(STEPS.payments),
    subscriptions: mapSteps(STEPS.subscriptions),
    checkouts: mapSteps(STEPS.checkouts),
  };
}

async function findAllScenarios(input: SimulationScenarioListInput) {
  const { skip, take } = buildPrismaPaginationParams(input);
  const where = buildSimulationScenarioSearchFilter(input.search);
  const [scenarios, total] = await Promise.all([
    prismaSingleton.simulationScenario.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.simulationScenario.count({ where }),
  ]);

  return buildPaginatedResponse({
    data: scenarios,
    page: input.page,
    limit: input.limit,
    total,
  });
}

async function createScenario(input: CreateSimulationScenarioInput) {
  return prismaSingleton.simulationScenario.create({
    data: {
      id: createPrefixedId("scn"),
      name: input.name,
      description: input.description ?? null,
      stepIntervalMs: input.stepIntervalMs ?? null,
      steps: input.steps as Prisma.InputJsonArray,
    },
  });
}

async function updateScenario(
  id: string,
  input: UpdateSimulationScenarioInput,
) {
  const existingScenario = await prismaSingleton.simulationScenario.findUnique({
    where: { id },
  });

  if (!existingScenario) {
    throw new NotFoundError(`Simulation scenario with ID ${id} was not found.`);
  }

  return prismaSingleton.simulationScenario.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      stepIntervalMs: input.stepIntervalMs,
      steps: input.steps as Prisma.InputJsonArray,
    },
  });
}

async function removeScenario(id: string) {
  const existingScenario = await prismaSingleton.simulationScenario.findUnique({
    where: { id },
  });

  if (!existingScenario) {
    throw new NotFoundError(`Simulation scenario with ID ${id} was not found.`);
  }

  await prismaSingleton.simulationScenario.delete({ where: { id } });
}

async function findAllScenarioRuns(scenarioId: string, input: PaginationInput) {
  const scenario = await prismaSingleton.simulationScenario.findUnique({
    where: { id: scenarioId },
  });

  if (!scenario) {
    throw new NotFoundError(
      `Simulation scenario with ID ${scenarioId} was not found.`,
    );
  }

  const { skip, take } = buildPrismaPaginationParams(input);
  const where = { scenarioId };

  const [runs, total] = await Promise.all([
    prismaSingleton.simulationRun.findMany({
      where: { scenarioId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.simulationRun.count({ where }),
  ]);

  return buildPaginatedResponse({
    data: runs,
    page: input.page,
    limit: input.limit,
    total,
  });
}

async function createScenarioRun(
  scenarioId: string,
  app: FastifyInstance,
  authorization?: string,
) {
  const scenario = await prismaSingleton.simulationScenario.findUnique({
    where: { id: scenarioId },
  });

  if (!scenario) {
    throw new NotFoundError(
      `Simulation scenario with ID ${scenarioId} was not found.`,
    );
  }

  const run = await prismaSingleton.simulationRun.create({
    data: {
      id: createPrefixedId("run"),
      scenarioId,
      status: "PENDING",
      currentStep: 0,
      totalSteps: (scenario.steps as Prisma.JsonArray).length,
    },
  });

  setImmediate(() => {
    void executeSimulation(
      app,
      run.id,
      scenario.steps,
      scenario.stepIntervalMs,
      authorization,
    ).catch((error: unknown) => {
      app.log.error(error, "Simulation execution failed.");
    });
  });

  return run;
}

async function getScenarioRun(id: string) {
  const run = await prismaSingleton.simulationRun.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { stepIndex: "asc" } },
    },
  });

  if (!run) {
    throw new NotFoundError(`Simulation run with ID ${id} was not found.`);
  }

  return run;
}

export const simulationService = {
  availableSteps,
  findAllScenarios,
  createScenario,
  updateScenario,
  removeScenario,
  findAllScenarioRuns,
  createScenarioRun,
  getScenarioRun,
};
