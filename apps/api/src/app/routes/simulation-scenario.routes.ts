import type { FastifyInstance } from "fastify";
import {
  createSimulationScenarioSchema,
  simulationScenarioListSchema,
  updateSimulationScenarioSchema,
} from "../schemas/simulation-scenario.schema.ts";
import { simulationScenarioService } from "../services/simulation-scenario.service.ts";
import { simulationScenarioDocs } from "../docs/simulation-scenario.docs.ts";

export async function simulationScenarioRoutes(app: FastifyInstance) {
  app.get("/", { schema: simulationScenarioDocs.findAll }, async (request, reply) => {
    const input = simulationScenarioListSchema.parse(request.query);
    const scenarios = await simulationScenarioService.findAll(input);
    return reply.status(200).send(scenarios);
  });

  app.post("/", { schema: simulationScenarioDocs.create }, async (request, reply) => {
    const input = createSimulationScenarioSchema.parse(request.body);
    const scenario = await simulationScenarioService.create(input);
    return reply.status(201).send(scenario);
  });

  app.patch("/:id", { schema: simulationScenarioDocs.update }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = updateSimulationScenarioSchema.parse(request.body);
    const scenario = await simulationScenarioService.update(id, input);
    return reply.status(200).send(scenario);
  });
}
