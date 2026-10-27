import type { FastifyInstance } from "fastify";
import { createSimulationScenarioDocs } from "../docs/create-simulation-scenario.docs.ts";
import { createSimulationScenarioSchema } from "../schemas/create-simulation-scenario.schema.ts";
import { createSimulationScenario } from "../services/create-simulation-scenario.service.ts";

export async function createSimulationScenarioRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { schema: createSimulationScenarioDocs.create },
    async (request, reply) => {
      const input = createSimulationScenarioSchema.parse(request.body);
      const scenario = await createSimulationScenario(input);
      return reply.status(201).send(scenario);
    },
  );
}
