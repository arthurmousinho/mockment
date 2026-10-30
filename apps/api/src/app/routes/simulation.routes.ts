import type { FastifyInstance } from "fastify";
import { simulationDocs } from "../docs/simulation.docs.ts";
import {
  createSimulationScenarioSchema,
  simulationScenarioListSchema,
  updateSimulationScenarioSchema,
} from "../schemas/simulation.schema.ts";
import { simulationScenarioService } from "../services/simulation-scenario.service.ts";
import { STEPS } from "../simulation/steps.ts";

export async function simulationRoutes(app: FastifyInstance) {
  app.get(
    "/steps",
    { schema: simulationDocs.availableSteps },
    async (_, reply) => {
      const steps = STEPS.map(({ id, name, description, input, output }) => ({
        id,
        name,
        desc: description,
        input,
        output,
      }));

      return reply.status(200).send(steps);
    },
  );

  app.get(
    "/scenarios",
    { schema: simulationDocs.findAllScenarios },
    async (request, reply) => {
      const input = simulationScenarioListSchema.parse(request.query);
      const scenarios = await simulationScenarioService.findAll(input);
      return reply.status(200).send(scenarios);
    },
  );

  app.post(
    "/scenarios",
    { schema: simulationDocs.createScenario },
    async (request, reply) => {
      const input = createSimulationScenarioSchema.parse(request.body);
      const scenario = await simulationScenarioService.create(input);
      return reply.status(201).send(scenario);
    },
  );

  app.patch(
    "/scenarios/:id",
    { schema: simulationDocs.updateScenario },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const input = updateSimulationScenarioSchema.parse(request.body);
      const scenario = await simulationScenarioService.update(id, input);
      return reply.status(200).send(scenario);
    },
  );
}
