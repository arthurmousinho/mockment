import { z } from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";

export const simulationScenarioStepSchema = z.object({
  name: z.string().trim().min(1).max(100),
  action: z.string().trim().min(1).max(80),
  input: z.record(z.string(), z.unknown()).optional(),
});

export const simulationScenarioListSchema = searchablePaginationSchema;
export type SimulationScenarioListInput = z.infer<
  typeof simulationScenarioListSchema
>;

export const simulationScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  stepIntervalMs: z.number().int().nullable(),
  steps: z.array(simulationScenarioStepSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
