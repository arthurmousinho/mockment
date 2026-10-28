import { z } from "zod";
import { checkoutCreateInputSchema, checkoutGetInputSchema } from "./checkout.ts";
import {
  paymentCancelInputSchema,
  paymentCreateInputSchema,
  paymentGetInputSchema,
} from "./payment.ts";
import { utilityWaitInputSchema } from "./utility.ts";

export {
  checkoutCreateInputSchema,
  checkoutGetInputSchema,
  paymentCancelInputSchema,
  paymentCreateInputSchema,
  paymentGetInputSchema,
  utilityWaitInputSchema,
};
export { MAX_WAIT_DURATION_MS } from "./utility.ts";

/** Input validators keyed by the same stable IDs as the built-in steps. */
export const simulationStepInputSchemas = {
  "payment.create": paymentCreateInputSchema,
  "payment.get": paymentGetInputSchema,
  "payment.cancel": paymentCancelInputSchema,
  "checkout.create": checkoutCreateInputSchema,
  "checkout.get": checkoutGetInputSchema,
  "utility.wait": utilityWaitInputSchema,
} as const;

export type SimulationStepInputById = {
  [StepId in keyof typeof simulationStepInputSchemas]: z.infer<
    (typeof simulationStepInputSchemas)[StepId]
  >;
};

export type {
  CheckoutCreateInput,
  CheckoutGetInput,
} from "./checkout.ts";
export type {
  PaymentCancelInput,
  PaymentCreateInput,
  PaymentGetInput,
} from "./payment.ts";
export type { UtilityWaitInput } from "./utility.ts";
