import type { SimulationStepDefinition } from "../types.ts";

export const utilitySteps = {
  "utility.wait": {
    id: "utility.wait",
    name: "Wait",
    inputFields: [
      {
        name: "durationMs",
        label: "Duration in milliseconds",
        type: "number",
        required: true,
      },
    ],
    outputFields: [],
    executor: { type: "local", operationId: "utility.wait" },
  },
} as const satisfies Record<string, SimulationStepDefinition>;
