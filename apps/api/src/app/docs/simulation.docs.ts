import { z } from "zod";
import { openApiSchema } from "../../common/openapi.ts";
import { availableSimulationStepSchema } from "../schemas/simulation.schema.ts";

export const simulationDocs = {
  availableSteps: {
    summary: "List available simulation steps",
    description: "Returns step definitions for building simulation forms.",
    tags: ["Simulations"],
    response: {
      200: {
        description: "The available simulation steps.",
        content: {
          "application/json": {
            schema: openApiSchema(z.array(availableSimulationStepSchema)),
          },
        },
      },
    },
  },
};
