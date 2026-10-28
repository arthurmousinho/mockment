import { checkoutSteps } from "./checkout.ts";
import { paymentSteps } from "./payment.ts";
import { utilitySteps } from "./utility.ts";

export { checkoutSteps, paymentSteps, utilitySteps };

/** All built-in step definitions, keyed by their stable step ID. */
export const simulationSteps = {
  ...paymentSteps,
  ...checkoutSteps,
  ...utilitySteps,
} as const;

export type SimulationStepDefinitionId = keyof typeof simulationSteps;
