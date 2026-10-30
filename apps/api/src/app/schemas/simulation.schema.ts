import { z } from "zod";
import { searchablePaginationSchema } from "../../common/search.schema.ts";

export const availableSimulationStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  desc: z.string().optional(),
  input: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(["string", "number", "boolean", "select"]),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    }),
  ),
  output: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["string", "number", "boolean"]),
    }),
  ),
});

export const simulationScenarioStepSchema = z.object(
  {
    name: z
      .string({ error: "Step name must be a string." })
      .trim()
      .min(1, "Step name is required.")
      .max(100, "Step name must be at most 100 characters long."),
    action: z
      .string({ error: "Step action must be a string." })
      .trim()
      .min(1, "Step action is required.")
      .max(80, "Step action must be at most 80 characters long."),
    input: z
      .record(z.string(), z.unknown(), {
        error: "Step input must be an object.",
      })
      .optional(),
  },
  { error: "Each scenario step must be an object." },
);

export const simulationScenarioListSchema = searchablePaginationSchema;
export type SimulationScenarioListInput = z.infer<
  typeof simulationScenarioListSchema
>;

export const createSimulationScenarioSchema = z.object(
  {
    name: z
      .string({ error: "Scenario name must be a string." })
      .trim()
      .min(1, "Scenario name is required.")
      .max(100, "Scenario name must be at most 100 characters long."),
    description: z
      .string({ error: "Scenario description must be a string." })
      .trim()
      .max(500, "Scenario description must be at most 500 characters long.")
      .optional(),
    stepIntervalMs: z
      .number({ error: "Step interval must be a number." })
      .int("Step interval must be an integer number of milliseconds.")
      .positive("Step interval must be greater than zero.")
      .max(60_000, "Step interval must be at most 60000 milliseconds.")
      .nullable()
      .optional(),
    steps: z
      .array(simulationScenarioStepSchema, { error: "Steps must be a list." })
      .min(1, "A scenario must contain at least one step.")
      .max(100, "A scenario can contain at most 100 steps."),
  },
  { error: "Scenario data must be an object." },
);

export type CreateSimulationScenarioInput = z.infer<
  typeof createSimulationScenarioSchema
>;

export const updateSimulationScenarioSchema = z.object(
  {
    name: z
      .string({ error: "Scenario name must be a string." })
      .trim()
      .min(1, "Scenario name is required.")
      .max(100, "Scenario name must be at most 100 characters long."),
    description: z
      .string({ error: "Scenario description must be a string." })
      .trim()
      .max(500, "Scenario description must be at most 500 characters long.")
      .nullable(),
    stepIntervalMs: z
      .number({ error: "Step interval must be a number." })
      .int("Step interval must be an integer number of milliseconds.")
      .positive("Step interval must be greater than zero.")
      .max(60_000, "Step interval must be at most 60000 milliseconds.")
      .nullable(),
    steps: z
      .array(simulationScenarioStepSchema, { error: "Steps must be a list." })
      .min(1, "A scenario must contain at least one step.")
      .max(100, "A scenario can contain at most 100 steps."),
  },
  { error: "Scenario data must be an object." },
);

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
