import { z } from "zod";
import type { Connection, Edge, Node } from "@xyflow/react";
import type { SimulationScenarioStep } from "@/http/simulation-scenarios-http";

const inputFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["string", "number", "boolean", "select"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});
const outputFieldSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean"]),
});

// Accept the current API arrays as well as the fields envelope used by the UI.
export const availableStepsSchema = z.array(
  z.object({
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
  }),
);

export type AvailableStep = z.infer<typeof availableStepsSchema>[number];
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
  const input = target?.data.step?.input.fields.find(
    (field) => `input:${field.name}` === connection.targetHandle,
  );
  if (!output || !input)
    return "Connect an output to an input of an available step.";
  if (output.type !== (input.type === "select" ? "string" : input.type))
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
      if (value === undefined || value === "") {
        if (field.required)
          throw new Error(
            `${node.data.step.name}: ${field.label} is required.`,
          );
        continue;
      }
      const type = field.type === "select" ? "string" : field.type;
      if (
        typeof value !== type ||
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
    for (const edge of incoming)
      delete input[edge.targetHandle!.slice("input:".length)];
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
