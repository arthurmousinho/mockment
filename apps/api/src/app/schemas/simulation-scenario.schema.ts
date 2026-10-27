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

export const createSimulationScenarioSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  stepIntervalMs: z.number().int().positive().max(60_000).nullable().optional(),
  steps: z.array(simulationScenarioStepSchema).min(1).max(100),
});

export type CreateSimulationScenarioInput = z.infer<
  typeof createSimulationScenarioSchema
>;

export const updateSimulationScenarioSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable(),
  stepIntervalMs: z.number().int().positive().max(60_000).nullable(),
  steps: z.array(simulationScenarioStepSchema).min(1).max(100),
});

export type UpdateSimulationScenarioInput = z.infer<
  typeof updateSimulationScenarioSchema
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
