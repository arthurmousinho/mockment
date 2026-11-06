import { SimulationRunStatus } from "../../../generated/prisma/enums.ts";
import type { SimulationRunWhereInput } from "../../../generated/prisma/models/SimulationRun.ts";
import { buildSearchFilter } from "../../common/search.ts";

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
