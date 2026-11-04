import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  paginationParamsSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  availableSimulationStepsSchema,
  createSimulationScenarioSchema,
  simulationRunDetailsSchema,
  simulationRunSchema,
  simulationScenarioSchema,
  updateSimulationScenarioSchema,
} from "../schemas/simulation.schema.ts";

export const simulationDocs = {
  getScenario: {
    summary: "Get a simulation scenario",
    description: "Returns a saved scenario with its ordered steps and settings.",
    tags: ["Simulations"],
    params: idParamsSchema,
    response: {
      200: {
        description: "The saved scenario.",
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
  findAllScenarioRuns: {
    summary: "List simulation scenario runs",
    description:
      "Returns paginated runs for a scenario in reverse chronological order, without step run details.",
    tags: ["Simulations"],
    params: idParamsSchema,
    querystring: paginationParamsSchema,
    response: {
      200: {
        description: "The scenario's runs.",
        content: {
          "application/json": {
            schema: paginatedResponseSchema(simulationRunSchema),
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
  getScenarioRun: {
    summary: "Get a simulation scenario run",
    description:
      "Returns a run and its step runs ordered by step index. Newly created runs have an empty steps array.",
    tags: ["Simulations"],
    params: idParamsSchema,
    response: {
      200: {
        description: "The simulation run and its step runs.",
        content: {
          "application/json": {
            schema: openApiSchema(simulationRunDetailsSchema),
          },
        },
      },
      404: {
        description: "The simulation run was not found.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "NOT_FOUND",
              code: 404,
              message: "Simulation run with ID {id} was not found.",
            }),
          },
        },
      },
    },
  },
  createScenarioRun: {
    summary: "Create a simulation scenario run",
    description:
      "Creates a pending run with the scenario's step count. Does not execute steps or create step run records yet.",
    tags: ["Simulations"],
    params: idParamsSchema,
    response: {
      201: {
        description: "The pending run was created.",
        content: {
          "application/json": {
            schema: openApiSchema(simulationRunSchema),
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
  removeScenario: {
    summary: "Delete a simulation scenario",
    description: "Permanently deletes a scenario and all its runs and step runs.",
    tags: ["Simulations"],
    params: idParamsSchema,
    response: {
      204: { description: "The scenario was deleted." },
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
  availableSteps: {
    summary: "List available simulation steps",
    description:
      "Returns step definitions grouped by payments, subscriptions, and checkouts for building simulation forms.",
    tags: ["Simulations"],
    response: {
      200: {
        description: "The available simulation steps.",
        content: {
          "application/json": {
            schema: openApiSchema(availableSimulationStepsSchema),
          },
        },
      },
    },
  },
  findAllScenarios: {
    summary: "List simulation scenarios",
    description:
      "Returns saved simulation scenarios in reverse chronological order. Search matches scenario names and descriptions.",
    tags: ["Simulations"],
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
  createScenario: {
    summary: "Create a simulation scenario",
    description: "Saves a named scenario with an ordered list of steps.",
    tags: ["Simulations"],
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
  updateScenario: {
    summary: "Update a simulation scenario",
    description: "Updates the name, description, delay, and ordered steps.",
    tags: ["Simulations"],
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
