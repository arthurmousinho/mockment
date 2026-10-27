import type { Prisma } from "../../../generated/prisma/client.ts";
import { NotFoundError } from "../../common/http-error.ts";
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
} from "../schemas/simulation-scenario.schema.ts";
import { buildSimulationScenarioSearchFilter } from "../filters/simulation-scenario.filters.ts";

async function findAll(input: SimulationScenarioListInput) {
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

async function create(input: CreateSimulationScenarioInput) {
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

async function update(id: string, input: UpdateSimulationScenarioInput) {
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

export const simulationScenarioService = { findAll, create, update };
