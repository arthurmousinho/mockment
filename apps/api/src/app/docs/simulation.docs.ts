import {
  httpErrorSchema,
  idParamsSchema,
  openApiSchema,
  paginatedResponseSchema,
  searchablePaginationParamsSchema,
} from "../../common/openapi.ts";
import {
  availableSimulationStepsSchema,
  createSimulationScenarioSchema,
  simulationScenarioSchema,
  updateSimulationScenarioSchema,
} from "../schemas/simulation.schema.ts";

export const simulationDocs = {
  removeScenario: {
    summary: "Delete a simulation scenario",
    description: "Permanently deletes a scenario that has no runs.",
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
      409: {
        description: "The scenario has existing runs.",
        content: {
          "application/json": {
            schema: httpErrorSchema({
              error: "CONFLICT",
              code: 409,
              message:
                "Simulation scenarios with existing runs cannot be deleted.",
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
