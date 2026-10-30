import { Prisma } from "../../../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../../common/http-error.ts";
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

async function remove(id: string) {
  try {
    await prismaSingleton.simulationScenario.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new NotFoundError(
          `Simulation scenario with ID ${id} was not found.`,
        );
      }
      if (error.code === "P2003") {
        throw new ConflictError(
          "Simulation scenarios with existing runs cannot be deleted.",
        );
      }
    }
    throw error;
  }
}

export const simulationScenarioService = { findAll, create, update, remove };
