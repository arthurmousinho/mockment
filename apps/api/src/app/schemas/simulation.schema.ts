import { z } from "zod";

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
