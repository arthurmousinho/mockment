import fastifySchedule from "@fastify/schedule";
import type { FastifyInstance } from "fastify";
import { registerSubscriptionJob } from "../app/jobs/process-subscriptions.job.ts";
import { registerVirtualClockJob } from "../app/jobs/virtual-clock.job.ts";

export async function registerScheduler(app: FastifyInstance) {
  await app.register(fastifySchedule);
  registerVirtualClockJob(app);
  registerSubscriptionJob(app);
}
