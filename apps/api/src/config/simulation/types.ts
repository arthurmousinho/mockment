export type StepInputField = {
  name: string;
  label: string;
  type: "string" | "string[]" | "object[]" | "number" | "boolean" | "select";
  required: boolean;
  options?: string[];
  fields?: (Omit<StepInputField, "type" | "fields"> & {
    type: "string" | "number" | "boolean" | "select";
  })[];
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

export type StepConnection = {
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
};

export type Step = {
  id: string;
  name: string;
  description?: string;
  input: StepInputField[];
  output: StepOuputField[];
  executor: StepHTTPExecutor | StepWaitExecutor;
  migrateInput?: (input: Record<string, unknown>, connections: StepConnection[]) => {
    input: Record<string, unknown>;
    connections: StepConnection[];
  };
};
