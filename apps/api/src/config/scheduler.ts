import fastifySchedule from "@fastify/schedule";
import type { FastifyInstance } from "fastify";
import { registerSubscriptionJob } from "../app/jobs/process-subscriptions.job.ts";

export async function registerScheduler(app: FastifyInstance) {
  await app.register(fastifySchedule);
}
