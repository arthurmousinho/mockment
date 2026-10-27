import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  createSimulationScenarioSchema,
  simulationScenarioSchema,
  updateSimulationScenarioSchema,
} from "../schemas/simulation-scenario.schema.ts";

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
  update: {
    summary: "Update a simulation scenario",
    description: "Updates the name, description, delay, and ordered steps.",
    tags: ["Simulation Scenarios"],
    params: idParamsSchema,
    body: openApiSchema(updateSimulationScenarioSchema),
    response: {
      200: {
        description: "The updated scenario.",
        content: {
          "application/json": {
            schema: openApiSchema(simulationScenarioSchema),
          },
        },
      },
      404: {
        description: "The scenario was not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Simulation scenario with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
};
