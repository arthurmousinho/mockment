import type { FastifyInstance } from "fastify";
import { AsyncTask, CronJob } from "toad-scheduler";
import { virtualClockService } from "../services/virtual-clock.service.ts";

export function registerVirtualClockJob(app: FastifyInstance) {
  const task = new AsyncTask(
    "persist-virtual-clock",
    async () => {
      app.log.warn("Ticking virtual clock");
      const updatedVirtualClock = await virtualClockService.tickOneMinute();
      app.log.warn(
        `New virtual clock dateTime: ${updatedVirtualClock.currentDateTime.toISOString()}`,
      );
    },
    (error) => {
      app.log.error(error, "Failed to persist virtual clock");
    },
  );

  const job = new CronJob({ cronExpression: "* * * * *" }, task); // Every minute

  app.scheduler.addCronJob(job);
}
