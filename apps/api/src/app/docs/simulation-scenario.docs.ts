import {
  openApiSchema,
  paginatedResponseSchema,
  paginationParamsSchema,
} from "../../common/openapi.ts";
import { simulationScenarioSchema } from "../schemas/simulation-scenario.schema.ts";

export const simulationScenarioDocs = {
  findAll: {
    summary: "List simulation scenarios",
    description: "Returns saved simulation scenarios in reverse chronological order.",
    tags: ["Simulation Scenarios"],
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "The saved scenarios.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(simulationScenarioSchema),
          },
        },
      },
    },
  },
};
