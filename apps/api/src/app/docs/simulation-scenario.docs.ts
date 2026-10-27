import {
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import { simulationScenarioSchema } from "../schemas/simulation-scenario.schema.ts";

export const simulationScenarioDocs = {
  findAll: {
    summary: "List simulation scenarios",
    description:
      "Returns saved simulation scenarios in reverse chronological order. Search matches scenario names and descriptions.",
    tags: ["Simulation Scenarios"],
    querystring: searchablePaginationParamsSchema,
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
