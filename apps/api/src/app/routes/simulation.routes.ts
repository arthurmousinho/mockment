import type { FastifyInstance } from "fastify";
import { paginationSchema } from "../../common/pagination.schema.ts";
import { simulationDocs } from "../docs/simulation.docs.ts";
import {
  createSimulationScenarioSchema,
  simulationScenarioListSchema,
  updateSimulationScenarioSchema,
} from "../schemas/simulation.schema.ts";
import { simulationService } from "../services/simulation.service.ts";

export async function simulationRoutes(app: FastifyInstance) {
  app.get(
    "/scenarios/:id",
    { schema: simulationDocs.getScenario },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const scenario = await simulationService.getScenario(id);
      return reply.status(200).send(scenario);
    },
  );

  app.get(
    "/scenarios/:id/runs",
    { schema: simulationDocs.findAllScenarioRuns },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const input = paginationSchema.parse(request.query);
      const runs = await simulationService.findAllScenarioRuns(id, input);
      return reply.status(200).send(runs);
    },
  );

  app.get(
    "/runs/:id",
    { schema: simulationDocs.getScenarioRun },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const run = await simulationService.getScenarioRun(id);
      return reply.status(200).send(run);
    },
  );

  app.post(
    "/scenarios/:id/runs",
    { schema: simulationDocs.createScenarioRun },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const run = await simulationService.createScenarioRun(id);
      return reply.status(201).send(run);
    },
  );

  app.delete(
    "/scenarios/:id",
    { schema: simulationDocs.removeScenario },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await simulationService.removeScenario(id);
      return reply.status(204).send();
    },
  );

  app.get(
    "/steps",
    { schema: simulationDocs.availableSteps },
    async (_, reply) => {
      const steps = simulationService.availableSteps();
      return reply.status(200).send(steps);
    },
  );

  app.get(
    "/scenarios",
    { schema: simulationDocs.findAllScenarios },
    async (request, reply) => {
      const input = simulationScenarioListSchema.parse(request.query);
      const scenarios = await simulationService.findAllScenarios(input);
      return reply.status(200).send(scenarios);
    },
  );

  app.post(
    "/scenarios",
    { schema: simulationDocs.createScenario },
    async (request, reply) => {
      const input = createSimulationScenarioSchema.parse(request.body);
      const scenario = await simulationService.createScenario(input);
      return reply.status(201).send(scenario);
    },
  );

  app.patch(
    "/scenarios/:id",
    { schema: simulationDocs.updateScenario },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const input = updateSimulationScenarioSchema.parse(request.body);
      const scenario = await simulationService.updateScenario(id, input);
      return reply.status(200).send(scenario);
    },
  );
}
