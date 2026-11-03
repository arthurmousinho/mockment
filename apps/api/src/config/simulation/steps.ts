import { PAYMENT_STEPS } from "./steps/payment.steps.ts";
import { SUBSCRIPTION_STEPS } from "./steps/subscription.steps.ts";
import { CHECKOUT_STEPS } from "./steps/checkout.steps.ts";

export const STEPS = {
  payments: PAYMENT_STEPS,
  subscriptions: SUBSCRIPTION_STEPS,
  checkouts: CHECKOUT_STEPS,
} as const;
