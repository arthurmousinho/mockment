import { paymentService } from "./payment.service.ts";

async function getMetrics() {
  return { payments: await paymentService.getMetrics() };
}

export const metricService = { getMetrics };
