import type { FastifyInstance } from "fastify";
import { AsyncTask, CronJob } from "toad-scheduler";
import { virtualClockService } from "../services/virtual-clock.service.ts";

export function registerMockmentTickJob(app: FastifyInstance) {
  const task = new AsyncTask(
    "mockment-tick",
    async () => {
      const updatedVirtualClock = await virtualClockService.tickOneMinute();

      console.log(`
        \n
        MOCKMENT TICK JOB COMPLETED ✅!
        \n
        • Updated virtual clock datetime: ${updatedVirtualClock.currentDateTime.toISOString()}
        • Processed due subscriptions: ${updatedVirtualClock.processedSubscriptions}
        • Created payments: ${updatedVirtualClock.paymentsCreated}
        • Expired checkouts: ${updatedVirtualClock.expiredCheckoutsCount}
        \n
      `);
    },
    (error) => {
      app.log.error(error, "Failed to process Mockment tick");
    },
  );

  const job = new CronJob(
    {
      cronExpression: "* * * * *",
    },
    task,
  );

  app.scheduler.addCronJob(job);
}
