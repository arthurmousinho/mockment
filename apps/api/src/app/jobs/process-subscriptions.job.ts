import type { FastifyInstance } from "fastify";
import { AsyncTask, CronJob } from "toad-scheduler";
import { subscriptionService } from "../services/subscription.service.ts";

export function registerSubscriptionJob(app: FastifyInstance) {
  const task = new AsyncTask(
    "process-due-subscriptions",
    async () => {
      app.log.warn("Processing due subscriptions");
      const processedSubscriptions =
        await subscriptionService.processDueSubscriptions();
      app.log.warn(
        `Processed ${processedSubscriptions.processedSubscriptions} due subscriptions. Created ${processedSubscriptions.paymentsCreated} payments.`,
      );
    },
    (error) => {
      app.log.error(error, "Failed to process due subscriptions");
    },
  );

  const job = new CronJob({ cronExpression: "* * * * *" }, task); // Every minute

  app.scheduler.addCronJob(job);
}
