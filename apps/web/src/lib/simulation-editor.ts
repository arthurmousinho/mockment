import { z } from "zod";
import type { Connection, Edge, Node } from "@xyflow/react";
import type { SimulationScenarioStep } from "@/http/simulations-http";

const inputFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum([
    "string",
    "string[]",
    "object[]",
    "number",
    "boolean",
    "select",
  ]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  fields: z
    .array(
      z.object({
        name: z.string(),
        label: z.string(),
        type: z.enum(["string", "number", "boolean", "select"]),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});
const outputFieldSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean"]),
});

// Accept the current API arrays as well as the fields envelope used by the UI.
const availableStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  desc: z.string().optional(),
  input: z.union([
    z.array(inputFieldSchema).transform((fields) => ({ fields })),
    z.object({ fields: z.array(inputFieldSchema) }),
  ]),
  output: z.union([
    z.array(outputFieldSchema).transform((fields) => ({ fields })),
    z.object({ fields: z.array(outputFieldSchema) }),
  ]),
});

export const availableStepsSchema = z.object({
  payments: z.array(availableStepSchema),
  subscriptions: z.array(availableStepSchema),
  checkouts: z.array(availableStepSchema),
  invoices: z.array(availableStepSchema),
  customers: z.array(availableStepSchema),
  products: z.array(availableStepSchema),
});

export type AvailableStep = z.infer<typeof availableStepSchema>;
export type AvailableStepGroups = z.infer<typeof availableStepsSchema>;
export type StepFlowNode = Node<
  {
    stepId: string;
    step: AvailableStep | undefined;
    input: Record<string, unknown>;
  },
  "step"
>;

const graphEdgeSchema = z.object({
  source: z.string(),
  sourceHandle: z.string(),
  target: z.string(),
  targetHandle: z.string(),
});
const editorMetadataSchema = z.object({
  version: z.literal(1),
  nodeId: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  connections: z.array(graphEdgeSchema),
});

export function connectionError(
  connection: Connection | Edge,
  nodes: StepFlowNode[],
  edges: Edge[],
): string | null {
  if (connection.source === connection.target)
    return "A step cannot connect to itself.";
  const source = nodes.find((node) => node.id === connection.source);
  const target = nodes.find((node) => node.id === connection.target);
  const output = source?.data.step?.output.fields.find(
    (field) => `output:${field.name}` === connection.sourceHandle,
  );
  const objectHandle = /^input:([^:]+):(0|[1-9]\d*):([^:]+)$/.exec(
    connection.targetHandle ?? "",
  );
  const objectField =
    objectHandle &&
    target?.data.step?.input.fields.find(
      (field) => field.name === objectHandle[1] && field.type === "object[]",
    );
  const objectItems = objectField && target?.data.input[objectField.name];
  const nestedInput =
    objectField &&
    Array.isArray(objectItems) &&
    Number(objectHandle![2]) < objectItems.length &&
    objectField.fields?.find((field) => field.name === objectHandle![3]);
  const input =
    nestedInput ||
    target?.data.step?.input.fields.find((field) =>
      field.type === "string[]"
        ? new RegExp(`^input:${field.name}:(0|[1-9]\\d*)$`).test(
            connection.targetHandle ?? "",
          ) &&
          Array.isArray(target?.data.input[field.name]) &&
          Number(connection.targetHandle!.split(":").at(-1)) <
            (target.data.input[field.name] as unknown[]).length
        : `input:${field.name}` === connection.targetHandle,
    );
  if (!output || !input)
    return "Connect an output to an input of an available step.";
  if (
    output.type !==
    (input.type === "select" || input.type === "string[]"
      ? "string"
      : input.type)
  )
    return "The output and input types must match.";
  if (
    edges.some(
      (edge) =>
        edge.target === connection.target &&
        edge.targetHandle === connection.targetHandle,
    )
  )
    return "Each input can have only one connection.";

  const pending = [connection.target];
  const visited = new Set<string>();
  while (pending.length) {
    const id = pending.pop()!;
    if (id === connection.source)
      return "This connection would create a cycle.";
    if (visited.has(id)) continue;
    visited.add(id);
    pending.push(
      ...edges.filter((edge) => edge.source === id).map((edge) => edge.target),
    );
  }
  return null;
}

export function restoreGraph(
  steps: SimulationScenarioStep[],
  definitions: AvailableStep[],
) {
  const edges: Edge[] = [];
  const nodes: StepFlowNode[] = steps.map((saved, index) => {
    const { __editor, ...input } = saved.input ?? {};
    const metadata =
      __editor === undefined ? undefined : editorMetadataSchema.parse(__editor);
    if (
      (saved.action === "checkout.createProducts" ||
        saved.action === "checkout.createStandalone") &&
      input.allowedMethods === undefined &&
      (input.method !== undefined ||
        metadata?.connections.some(
          (connection) => connection.targetHandle === "input:method",
        ))
    ) {
      input.allowedMethods = [input.method ?? ""];
      delete input.method;
      for (const connection of metadata?.connections ?? []) {
        if (connection.targetHandle === "input:method")
          connection.targetHandle = "input:allowedMethods:0";
      }
    }
    if (
      saved.action === "checkout.createProducts" &&
      input.products === undefined &&
      (Array.isArray(input.productId) ||
        typeof input.productId === "string" ||
        metadata?.connections.some(
          (connection) => connection.targetHandle === "input:productId",
        ))
    ) {
      const ids = Array.isArray(input.productId)
        ? input.productId
        : [input.productId];
      input.products = ids.map((productId) => ({
        productId,
        quantity: input.quantity,
      }));
      delete input.productId;
      delete input.quantity;
      for (const connection of metadata?.connections ?? []) {
        connection.targetHandle = connection.targetHandle.replace(
          /^input:productId:(\d+)$/,
          "input:products:$1:productId",
        );
        if (connection.targetHandle === "input:productId")
          connection.targetHandle = "input:products:0:productId";
      }
      if (metadata)
        metadata.connections = metadata.connections.flatMap((connection) =>
          connection.targetHandle === "input:quantity"
            ? ids.map((_, index) => ({
                ...connection,
                targetHandle: `input:products:${index}:quantity`,
              }))
            : [connection],
        );
    }
    if (metadata)
      edges.push(
        ...metadata.connections.map((edge, i) => ({
          ...edge,
          id: `${metadata.nodeId}-edge-${i}`,
        })),
      );
    return {
      id: metadata?.nodeId ?? `legacy-${index + 1}`,
      type: "step",
      position: metadata?.position ?? { x: index * 380, y: 60 },
      data: {
        stepId: saved.action,
        step: definitions.find((step) => step.id === saved.action),
        input,
      },
    };
  });
  if (new Set(nodes.map((node) => node.id)).size !== nodes.length)
    throw new Error("The scenario has duplicate node IDs.");
  return { nodes, edges };
}

export function serializeGraph(
  nodes: StepFlowNode[],
  edges: Edge[],
): SimulationScenarioStep[] {
  if (!nodes.length) throw new Error("Add at least one step before saving.");
  if (nodes.length > 100)
    throw new Error("A scenario can contain at most 100 steps.");
  const checked: Edge[] = [];
  for (const edge of edges) {
    const error = connectionError(
      {
        ...edge,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
      },
      nodes,
      checked,
    );
    if (error) throw new Error(error);
    checked.push(edge);
  }
  for (const node of nodes) {
    if (!node.data.step)
      throw new Error(
        `Step ${node.data.stepId} is unavailable. Remove or replace it before saving.`,
      );
    for (const field of node.data.step.input.fields) {
      if (
        edges.some(
          (edge) =>
            edge.target === node.id &&
            edge.targetHandle === `input:${field.name}`,
        )
      )
        continue;
      const value = node.data.input[field.name];
      if (field.type === "object[]" && Array.isArray(value)) {
        if ((field.required && !value.length) || !field.fields)
          throw new Error(`${node.data.step.name}: invalid ${field.label}.`);
        for (const [index, item] of value.entries()) {
          if (!item || typeof item !== "object" || Array.isArray(item))
            throw new Error(`${node.data.step.name}: invalid ${field.label}.`);
          for (const nested of field.fields) {
            if (
              edges.some(
                (edge) =>
                  edge.target === node.id &&
                  edge.targetHandle ===
                    `input:${field.name}:${index}:${nested.name}`,
              )
            )
              continue;
            const nestedValue = (item as Record<string, unknown>)[nested.name];
            if (nestedValue === undefined || nestedValue === "") {
              if (nested.required)
                throw new Error(
                  `${node.data.step.name}: ${nested.label} is required.`,
                );
              continue;
            }
            const type = nested.type === "select" ? "string" : nested.type;
            if (
              typeof nestedValue !== type ||
              (type === "number" && !Number.isFinite(nestedValue)) ||
              (nested.type === "select" &&
                !nested.options?.includes(String(nestedValue)))
            )
              throw new Error(
                `${node.data.step.name}: invalid ${nested.label}.`,
              );
          }
        }
        continue;
      }
      if (field.type === "string[]" && Array.isArray(value)) {
        if (
          (field.required && !value.length) ||
          value.some(
            (item, index) =>
              !edges.some(
                (edge) =>
                  edge.target === node.id &&
                  edge.targetHandle === `input:${field.name}:${index}`,
              ) &&
              (typeof item !== "string" ||
                !item.trim() ||
                (field.options !== undefined && !field.options.includes(item))),
          )
        )
          throw new Error(`${node.data.step.name}: invalid ${field.label}.`);
        continue;
      }
      if (value === undefined || value === "") {
        if (field.required)
          throw new Error(
            `${node.data.step.name}: ${field.label} is required.`,
          );
        continue;
      }
      const type = field.type === "select" ? "string" : field.type;
      if (
        (type === "string[]"
          ? !Array.isArray(value) ||
            value.length === 0 ||
            value.some((item) => typeof item !== "string" || !item.trim())
          : typeof value !== type) ||
        (type === "number" && !Number.isFinite(value))
      )
        throw new Error(`${node.data.step.name}: invalid ${field.label}.`);
      if (field.type === "select" && !field.options?.includes(String(value)))
        throw new Error(
          `${node.data.step.name}: select a valid ${field.label}.`,
        );
    }
  }

  // The API stores ordered steps. Keep dependencies first and attach editor-only
  // positions/connections inside input, without changing the existing API contract.
  const ordered: StepFlowNode[] = [];
  const remaining = [...nodes];
  while (remaining.length) {
    const index = remaining.findIndex((node) =>
      edges.every(
        (edge) =>
          edge.target !== node.id ||
          ordered.some((previous) => previous.id === edge.source),
      ),
    );
    if (index === -1) throw new Error("The scenario contains a cycle.");
    ordered.push(...remaining.splice(index, 1));
  }
  return ordered.map((node) => {
    const incoming = edges.filter((edge) => edge.target === node.id);
    const input = { ...node.data.input };
    for (const edge of incoming) {
      const handle = edge.targetHandle!.slice("input:".length);
      const objectMatch = /^([^:]+):(0|[1-9]\d*):([^:]+)$/.exec(handle);
      if (objectMatch && Array.isArray(input[objectMatch[1]])) {
        const values = [
          ...(input[objectMatch[1]] as Record<string, unknown>[]),
        ];
        const item = { ...values[Number(objectMatch[2])] };
        delete item[objectMatch[3]];
        values[Number(objectMatch[2])] = item;
        input[objectMatch[1]] = values;
        continue;
      }
      const match = /^(.*):(0|[1-9]\d*)$/.exec(handle);
      if (match && Array.isArray(input[match[1]])) {
        const values = [...(input[match[1]] as unknown[])];
        values[Number(match[2])] = "";
        input[match[1]] = values;
      } else delete input[handle];
    }
    for (const key of Object.keys(input))
      if (input[key] === "" || input[key] === undefined) delete input[key];
    return {
      name: node.data.step!.name,
      action: node.data.stepId,
      input: {
        ...input,
        __editor: {
          version: 1,
          nodeId: node.id,
          position: node.position,
          connections: incoming.map(
            ({ source, sourceHandle, target, targetHandle }) => ({
              source,
              sourceHandle,
              target,
              targetHandle,
            }),
          ),
        },
      },
    };
  });
}
