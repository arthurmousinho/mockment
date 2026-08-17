import type { FastifyInstance } from "fastify";
import { AsyncTask, CronJob } from "toad-scheduler";
import { subscriptionService } from "../services/subscription.service.ts";
import { virtualClockService } from "../services/virtual-clock.service.ts";

export function registerMockmentTickJob(app: FastifyInstance) {
  const task = new AsyncTask(
    "mockment-tick",
    async () => {
      const updatedVirtualClock = await virtualClockService.tickOneMinute();
      const processedSubscriptionResult =
        await subscriptionService.processDueSubscriptions();
      console.log(`
        \n
        MOCKMENT TICK JOB COMPLETED ✅!
        \n
        • Updated virtual clock datetime: ${updatedVirtualClock.currentDateTime.toISOString()}
        • Processed due subscriptions: ${processedSubscriptionResult.processedSubscriptions}
        • Created payments: ${processedSubscriptionResult.paymentsCreated}
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
