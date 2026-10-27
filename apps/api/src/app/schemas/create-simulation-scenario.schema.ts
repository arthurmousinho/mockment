import { z } from "zod";
import { simulationScenarioStepSchema } from "./simulation-scenario.schema.ts";

export const createSimulationScenarioSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  stepIntervalMs: z.number().int().positive().max(60_000).nullable().optional(),
  steps: z.array(simulationScenarioStepSchema).min(1).max(100),
});

export type CreateSimulationScenarioInput = z.infer<
  typeof createSimulationScenarioSchema
>;
