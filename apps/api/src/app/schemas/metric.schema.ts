import { z } from "zod";

export const metricsSchema = z.object({
  payments: z.object({
    totalPaymentVolume: z.number(),
    approvedVolume: z.number(),
    approvalRate: z.number(),
    totalTransactions: z.number(),
    averageTicket: z.number(),
    refundedVolume: z.number(),
  }),
});
