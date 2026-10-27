import type { Prisma } from "../../../generated/prisma/client.ts";
import { createPrefixedId } from "../../common/utils.ts";
import { prismaSingleton } from "../../config/prisma.ts";
import type { CreateSimulationScenarioInput } from "../schemas/create-simulation-scenario.schema.ts";

export async function createSimulationScenario(
  input: CreateSimulationScenarioInput,
) {
  return prismaSingleton.simulationScenario.create({
    data: {
      id: createPrefixedId("scenario"),
      name: input.name,
      description: input.description ?? null,
      stepIntervalMs: input.stepIntervalMs ?? null,
      steps: input.steps as Prisma.InputJsonArray,
    },
  });
}
