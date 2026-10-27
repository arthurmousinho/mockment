import { openApiSchema } from "../../common/openapi.ts";
import { simulationScenarioSchema } from "../schemas/simulation-scenario.schema.ts";
import { createSimulationScenarioSchema } from "../schemas/create-simulation-scenario.schema.ts";

export const createSimulationScenarioDocs = {
  create: {
    summary: "Create a simulation scenario",
    description: "Saves a named scenario with an ordered list of steps.",
    tags: ["Simulation Scenarios"],
    body: openApiSchema(createSimulationScenarioSchema),
    response: {
      201: {
        description: "The scenario was created.",
        content: {
          "application/json": {
            schema: openApiSchema(simulationScenarioSchema),
          },
        },
      },
    },
  },
};
