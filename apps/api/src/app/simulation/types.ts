export type StepInputField = {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "select";
  required: boolean;
  options?: string[];
};

export type StepOuputField = {
  name: string;
  type: "string" | "number" | "boolean";
};

export type StepHTTPExecutor = {
  type: "http";
  method: "GET" | "POST" | "PATCH" | "DELETE";
  endpoint: string;
};

export type StepWaitExecutor = {
  type: "wait";
};

export type Step = {
  id: string;
  name: string;
  description?: string;
  input: StepInputField[];
  output: StepOuputField[];
  executor: StepHTTPExecutor | StepWaitExecutor;
};
