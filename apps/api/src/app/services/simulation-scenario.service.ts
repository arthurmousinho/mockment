import { prismaSingleton } from "../../config/prisma.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";
import type { SimulationScenarioListInput } from "../schemas/simulation-scenario.schema.ts";
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

export const simulationScenarioService = { findAll };
