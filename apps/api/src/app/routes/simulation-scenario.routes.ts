import type { FastifyInstance } from "fastify";
import { simulationScenarioListSchema } from "../schemas/simulation-scenario.schema.ts";
import { simulationScenarioService } from "../services/simulation-scenario.service.ts";
import { simulationScenarioDocs } from "../docs/simulation-scenario.docs.ts";

export async function simulationScenarioRoutes(app: FastifyInstance) {
  app.get("/", { schema: simulationScenarioDocs.findAll }, async (request, reply) => {
    const input = simulationScenarioListSchema.parse(request.query);
    const scenarios = await simulationScenarioService.findAll(input);
    return reply.status(200).send(scenarios);
  });
}
