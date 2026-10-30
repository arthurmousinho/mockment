import { PAYMENT_STEPS } from "./steps/payment.steps.ts";
import { SUBSCRIPTION_STEPS } from "./steps/subscription.steps.ts";

export const STEPS = {
  payments: PAYMENT_STEPS,
  subscriptions: SUBSCRIPTION_STEPS,
} as const;
