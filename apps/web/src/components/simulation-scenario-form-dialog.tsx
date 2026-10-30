import { useState, type ReactNode } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
} from "@xyflow/react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepNode } from "@/components/step-node";
import {
  CreateSimulationScenarioRequest,
  UpdateSimulationScenarioRequest,
  FindAvailableSimulationStepsRequest,
  type SimulationScenario,
} from "@/http/simulation-scenarios-http";
import {
  connectionError,
  restoreGraph,
  serializeGraph,
  type AvailableStep,
  type StepFlowNode,
} from "@/lib/simulation-editor";
import "@xyflow/react/dist/style.css";

const nodeTypes = { step: StepNode };

export function SimulationScenarioFormDialog({
  children,
  scenario,
}: {
  children: ReactNode;
  scenario?: SimulationScenario;
}) {
  const [open, setOpen] = useState(false);
  const steps = FindAvailableSimulationStepsRequest(open);
  let graph: ReturnType<typeof restoreGraph> | undefined;
  let restoreError = "";
  if (steps.data) {
    try {
      graph = restoreGraph(scenario?.steps ?? [], steps.data);
    } catch {
      restoreError =
        "This scenario contains invalid editor metadata. Its saved data has been preserved.";
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex h-[92dvh] w-[96vw] max-w-[96vw] flex-col sm:max-w-[1600px]">
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>
            {scenario
              ? "Edit simulation scenario"
              : "Create simulation scenario"}
          </DialogTitle>
          <DialogDescription>
            Add steps and connect outputs to inputs. Scenarios are saved without
            execution.
          </DialogDescription>
        </DialogHeader>
        {steps.isPending && (
          <p role="status" className="p-6 text-muted-foreground">
            Loading available steps…
          </p>
        )}
        {steps.isError && (
          <div role="alert" className="space-y-3 p-6">
            <p>Failed to load available steps.</p>
            <Button variant="outline" onClick={() => void steps.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {restoreError && (
          <p role="alert" className="p-6 text-destructive">
            {restoreError}
          </p>
        )}
        {steps.data && graph && !steps.isError && open && (
          <ReactFlowProvider>
            <ScenarioEditor
              definitions={steps.data}
              initialNodes={graph.nodes}
              initialEdges={graph.edges}
              scenario={scenario}
              onSaved={() => setOpen(false)}
            />
          </ReactFlowProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ScenarioEditor({
  definitions,
  initialNodes,
  initialEdges,
  scenario,
  onSaved,
}: {
  definitions: AvailableStep[];
  initialNodes: StepFlowNode[];
  initialEdges: Edge[];
  scenario?: SimulationScenario;
  onSaved: () => void;
}) {
  const [name, setName] = useState(scenario?.name ?? "");
  const [description, setDescription] = useState(scenario?.description ?? "");
  const [interval, setInterval] = useState(
    scenario?.stepIntervalMs == null ? "" : String(scenario.stepIntervalMs),
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<StepFlowNode>(
    initialNodes.map((node) => ({ ...node, dragHandle: ".step-drag-handle" })),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [error, setError] = useState("");
  const { getNodes, getEdges, getViewport, setCenter, deleteElements } =
    useReactFlow<StepFlowNode>();
  const createScenario = CreateSimulationScenarioRequest();
  const updateScenario = UpdateSimulationScenarioRequest();
  const saving = createScenario.isPending || updateScenario.isPending;

  function addStep(step: AvailableStep) {
    if (getNodes().length >= 100) {
      toast.error("A scenario can contain at most 100 steps.");
      return;
    }
    const count = getNodes().length;
    const position = { x: count * 380, y: 40 };
    const node: StepFlowNode = {
      id: crypto.randomUUID(),
      type: "step",
      dragHandle: ".step-drag-handle",
      position,
      data: {
        stepId: step.id,
        step,
        input: Object.fromEntries(
          step.input.fields
            .filter((field) => field.type === "boolean")
            .map((field) => [field.name, false]),
        ),
      },
    };
    setNodes((current) => [...current, node]);
    void setCenter(position.x + 160, position.y + 280, {
      zoom: Math.min(getViewport().zoom, 0.85),
      duration: 250,
    });
    setError("");
  }

  function connect(connection: Connection) {
    setEdges((current) => {
      if (connectionError(connection, getNodes(), current)) return current;
      return addEdge(connection, current);
    });
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const delay = interval.trim() ? Number(interval) : null;
    if (!name.trim()) {
      setError("Enter a scenario name.");
      return;
    }
    if (
      delay !== null &&
      (!Number.isInteger(delay) || delay < 1 || delay > 60000)
    ) {
      setError("Delay must be between 1 and 60000 milliseconds.");
      return;
    }
    try {
      const steps = serializeGraph(getNodes(), getEdges());
      if (scenario) {
        updateScenario.mutate(
          {
            id: scenario.id,
            name: name.trim(),
            description: description.trim() || null,
            stepIntervalMs: delay,
            steps,
          },
          { onSuccess: onSaved },
        );
      } else {
        createScenario.mutate(
          {
            name: name.trim(),
            ...(description.trim() && { description: description.trim() }),
            stepIntervalMs: delay,
            steps,
          },
          { onSuccess: onSaved },
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Failed to prepare the scenario.",
      );
    }
  }

  return (
    <form onSubmit={save} className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid shrink-0 gap-3 sm:grid-cols-[1fr_1fr_10rem]">
        <div className="space-y-1">
          <Label htmlFor="scenario-name">Name</Label>
          <Input
            id="scenario-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
            placeholder="Payment flow"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="scenario-description">Description (optional)</Label>
          <Input
            id="scenario-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="scenario-interval">Delay (ms)</Label>
          <Input
            id="scenario-interval"
            type="number"
            value={interval}
            onChange={(event) => setInterval(event.target.value)}
            min={1}
            max={60000}
            placeholder="No delay"
          />
        </div>
      </div>
      <div
        className={`simulation-editor grid min-h-0 flex-1 grid-rows-[auto_1fr] overflow-hidden border lg:grid-cols-[220px_1fr] lg:grid-rows-1 ${saving ? "pointer-events-none opacity-60" : ""}`}
      >
        <aside className="max-h-32 space-y-2 overflow-y-auto border-b bg-muted/30 p-3 lg:max-h-none lg:border-r lg:border-b-0">
          <h2 className="text-xs font-medium">Available steps</h2>
          {!definitions.length && (
            <p className="text-xs text-muted-foreground">
              No steps available yet.
            </p>
          )}
          {definitions.map((step) => (
            <Button
              type="button"
              key={step.id}
              variant="outline"
              className="h-auto w-full justify-start whitespace-normal py-2 text-left"
              disabled={nodes.length >= 100 || saving}
              onClick={() => addStep(step)}
            >
              <PlusIcon className="shrink-0" />
              <span>{step.name}</span>
            </Button>
          ))}
          <p className="text-xs text-muted-foreground">
            Drag a node by its header. Connect a right output to a left input
            with the same type. Each input accepts one connection; cycles are
            blocked.
          </p>
        </aside>
        <div
          className="relative min-h-0"
          aria-label="Simulation scenario canvas"
        >
          <ReactFlow<StepFlowNode>
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={connect}
            isValidConnection={(connection) =>
              !connectionError(connection, getNodes(), getEdges())
            }
            onConnectEnd={(_, state) => {
              if (!state.isValid && state.toHandle)
                toast.error(
                  "Connection rejected: match types, use a free input, and avoid self-connections or cycles.",
                );
            }}
            edgesReconnectable={false}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            defaultViewport={{ x: 40, y: 20, zoom: 0.75 }}
            deleteKeyCode={["Backspace", "Delete"]}
            onNodesDelete={(deleted) =>
              setEdges((current) =>
                current.filter(
                  (edge) =>
                    !deleted.some(
                      (node) =>
                        node.id === edge.source || node.id === edge.target,
                    ),
                ),
              )
            }
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Choose a step to start building your scenario.
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {nodes.length} steps · {edges.length} connections
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={
            saving ||
            (!nodes.some((node) => node.selected) &&
              !edges.some((edge) => edge.selected))
          }
          onClick={() =>
            void deleteElements({
              nodes: getNodes().filter((node) => node.selected),
              edges: getEdges().filter((edge) => edge.selected),
            })
          }
        >
          <TrashIcon />
          Remove selected
        </Button>
      </div>
      {error && (
        <p role="alert" className="shrink-0 text-xs text-destructive">
          {error}
        </p>
      )}
      <DialogFooter className="shrink-0">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={saving}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={saving || !nodes.length}>
          {saving ? "Saving…" : "Save scenario"}
        </Button>
      </DialogFooter>
    </form>
  );
}
