import { checkoutSteps } from "./checkout.ts";
import { paymentSteps } from "./payment.ts";
import { utilitySteps } from "./utility.ts";
import type { SimulationStepDefinition } from "../types.ts";

export { checkoutSteps, paymentSteps, utilitySteps };

/** All built-in step definitions, keyed by their stable step ID. */
export const simulationSteps = {
  ...paymentSteps,
  ...checkoutSteps,
  ...utilitySteps,
} as const;

export type SimulationStepDefinitionId = keyof typeof simulationSteps;

type RegisteredStepDefinition =
  (typeof simulationSteps)[SimulationStepDefinitionId];

type PublicStepDefinitionFor<Step extends SimulationStepDefinition> = Pick<
  Step,
  "id" | "name" | "inputFields"
> & { description?: string };

/** Form metadata only. Executor settings and output metadata stay internal. */
export type PublicSimulationStepDefinition = {
  [StepId in SimulationStepDefinitionId]: PublicStepDefinitionFor<
    (typeof simulationSteps)[StepId]
  >;
}[SimulationStepDefinitionId];

export function getStepDefinition<StepId extends SimulationStepDefinitionId>(
  stepId: StepId,
): (typeof simulationSteps)[StepId];

export function getStepDefinition(
  stepId: string,
): RegisteredStepDefinition | undefined;

export function getStepDefinition(
  stepId: string,
): RegisteredStepDefinition | undefined {
  if (!Object.hasOwn(simulationSteps, stepId)) {
    return undefined;
  }

  return (simulationSteps as Record<string, RegisteredStepDefinition>)[stepId];
}

export function getAllStepDefinitions(): RegisteredStepDefinition[] {
  return Object.values(simulationSteps);
}

export function getPublicStepDefinitions(): PublicSimulationStepDefinition[] {
  return getAllStepDefinitions().map((definition) => {
    const sharedDefinition: SimulationStepDefinition = definition;

    return {
      id: definition.id,
      name: definition.name,
      ...(sharedDefinition.description === undefined
        ? {}
        : { description: sharedDefinition.description }),
      inputFields: definition.inputFields,
    };
  }) as PublicSimulationStepDefinition[];
}
