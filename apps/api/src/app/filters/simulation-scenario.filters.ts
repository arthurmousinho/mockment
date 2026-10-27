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
