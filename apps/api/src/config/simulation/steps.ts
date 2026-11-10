import { PAYMENT_STEPS } from "./steps/payment.steps.ts";
import { SUBSCRIPTION_STEPS } from "./steps/subscription.steps.ts";
import { CHECKOUT_STEPS } from "./steps/checkout.steps.ts";
import { CUSTOMER_STEPS } from "./steps/customer.steps.ts";
import { INVOICE_STEPS } from "./steps/invoice.steps.ts";

export const STEPS = {
  payments: PAYMENT_STEPS,
  subscriptions: SUBSCRIPTION_STEPS,
  checkouts: CHECKOUT_STEPS,
  invoices: INVOICE_STEPS,
  customers: CUSTOMER_STEPS,
} as const;
