import { SimulationRunStatus } from "../../../generated/prisma/enums.ts";
import type { SimulationRunWhereInput } from "../../../generated/prisma/models/SimulationRun.ts";
import type { SimulationScenarioWhereInput } from "../../../generated/prisma/models/SimulationScenario.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildSimulationScenarioSearchFilter(
  search?: string,
): SimulationScenarioWhereInput {
  return buildSearchFilter<SimulationScenarioWhereInput>(search, [
    (term) => ({ name: { contains: term } }),
    (term) => ({ description: { contains: term } }),
  ]);
}

export function buildSimulationRunSearchFilter(
  search?: string,
): SimulationRunWhereInput {
  return buildSearchFilter<SimulationRunWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ scenarioId: { contains: term } }),
    (term) => ({ scenario: { name: { contains: term } } }),
    (term) => ({
      status: {
        in: Object.values(SimulationRunStatus).filter((status) =>
          status.includes(term.toUpperCase()),
        ),
      },
    }),
  ]);
}
