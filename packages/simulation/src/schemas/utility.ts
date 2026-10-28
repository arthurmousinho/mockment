import { z } from "zod";

export const MAX_WAIT_DURATION_MS = 300_000;

export const utilityWaitInputSchema = z.object({
  durationMs: z
    .number({ error: "durationMs must be a number." })
    .int({ error: "durationMs must be an integer number of milliseconds." })
    .min(0, { error: "durationMs must be zero or greater." })
    .max(MAX_WAIT_DURATION_MS, {
      error: `durationMs must be at most ${MAX_WAIT_DURATION_MS} milliseconds.`,
    }),
});

export type UtilityWaitInput = z.infer<typeof utilityWaitInputSchema>;
