import type { FastifyInstance } from "fastify";
import { note } from "@clack/prompts";
import { AsyncTask, CronJob } from "toad-scheduler";
import { virtualClockService } from "../services/virtual-clock.service.ts";
import { format } from "date-fns";

export function registerMockmentTickJob(app: FastifyInstance) {
  const task = new AsyncTask(
    "mockment-tick",
    async () => {
      const {
        currentDateTime,
        processedSubscriptions,
        paymentsCreated,
        expiredCheckoutsCount,
      } = await virtualClockService.tickOneMinute();

      note(
        [
          `Virtual clock: ${format(currentDateTime, "dd MMM yyyy '·' HH:mm")}`,
          `Processed due subscriptions: ${processedSubscriptions}`,
          `Created payments: ${paymentsCreated}`,
          `Expired checkouts: ${expiredCheckoutsCount}`,
        ].join("\n"),
        "Mockment tick completed",
      );
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
