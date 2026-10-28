/** Stable identifier for a reusable simulation step, such as `payment.create`. */
export type SimulationStepId = `${string}.${string}`;

interface SimulationInputFieldBase {
  name: string;
  label: string;
  description?: string;
  required: boolean;
}

export interface StringSimulationInputField extends SimulationInputFieldBase {
  type: "string";
}

export interface NumberSimulationInputField extends SimulationInputFieldBase {
  type: "number";
}

export interface BooleanSimulationInputField extends SimulationInputFieldBase {
  type: "boolean";
}

export interface SelectSimulationInputField extends SimulationInputFieldBase {
  type: "select";
  options: Array<{
    label: string;
    value: string;
  }>;
}

/** A scalar field that a frontend can render as part of a step form. */
export type SimulationInputField =
  | StringSimulationInputField
  | NumberSimulationInputField
  | BooleanSimulationInputField
  | SelectSimulationInputField;

export interface SimulationOutputField {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
}

export type HttpSimulationMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** HTTP executor metadata only; the endpoint is a relative URL path. */
export interface HttpSimulationExecutor {
  type: "http";
  method: HttpSimulationMethod;
  endpoint: `/${string}`;
}

/** Reference to an operation implemented by the local simulation runtime. */
export interface LocalSimulationExecutor {
  type: "local";
  operationId: SimulationStepId;
}

export type SimulationExecutor = HttpSimulationExecutor | LocalSimulationExecutor;

/** Reusable metadata describing a step, its form, outputs, and executor. */
export interface SimulationStepDefinition {
  id: SimulationStepId;
  name: string;
  description?: string;
  inputFields: SimulationInputField[];
  outputFields: SimulationOutputField[];
  executor: SimulationExecutor;
}

export type SimulationStepInputValue = string | number | boolean;

/** User configuration for one occurrence of a step inside a scenario. */
export interface ConfiguredSimulationStep {
  stepId: SimulationStepId;
  input: Record<string, SimulationStepInputValue>;
}
