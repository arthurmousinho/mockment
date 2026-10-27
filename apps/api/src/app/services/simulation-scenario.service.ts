import { prismaSingleton } from "../../config/prisma.ts";
import { buildPaginatedResponse, buildPrismaPaginationParams } from "../../common/utils.ts";
import type { SimulationScenarioListInput } from "../schemas/simulation-scenario.schema.ts";

async function findAll(input: SimulationScenarioListInput) {
  const { skip, take } = buildPrismaPaginationParams(input);
  const [scenarios, total] = await Promise.all([
    prismaSingleton.simulationScenario.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.simulationScenario.count(),
  ]);

  return buildPaginatedResponse({
    data: scenarios,
    page: input.page,
    limit: input.limit,
    total,
  });
}

export const simulationScenarioService = { findAll };
