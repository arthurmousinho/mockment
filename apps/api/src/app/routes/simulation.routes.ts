import type { FastifyInstance } from "fastify";
import { simulationDocs } from "../docs/simulation.docs.ts";
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
}
