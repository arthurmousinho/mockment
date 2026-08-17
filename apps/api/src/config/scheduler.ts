import fastifySchedule from "@fastify/schedule";
import type { FastifyInstance } from "fastify";
import { registerMockmentTickJob } from "../app/jobs/mockment-tick.job.ts";

export async function registerScheduler(app: FastifyInstance) {
  await app.register(fastifySchedule);
  registerMockmentTickJob(app);
}
