import {
  Handle,
  Position,
  useNodeConnections,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StepFlowNode } from "@/lib/simulation-editor";
import { cn } from "@/lib/utils";

export function StepNode({ id, data, selected }: NodeProps<StepFlowNode>) {
  const { updateNodeData, deleteElements } = useReactFlow<StepFlowNode>();
  const connections = useNodeConnections({ handleType: "target" });
  const step = data.step;

  function changeInput(name: string, value: unknown) {
    updateNodeData(id, (node) => ({
      input: { ...node.data.input, [name]: value },
    }));
  }

  return (
    <div
      className={cn(
        "w-80 border bg-card text-card-foreground shadow-sm",
        selected && "border-primary ring-1 ring-primary",
      )}
    >
      <header className="step-drag-handle flex cursor-grab items-start justify-between gap-3 border-b bg-muted/50 px-4 py-3 active:cursor-grabbing">
        <div className="min-w-0">
          <p className="text-sm font-medium">{step?.name ?? data.stepId}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {step?.desc ?? "Step unavailable. Remove or replace it to save."}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="nodrag shrink-0"
          aria-label={`Remove ${step?.name ?? data.stepId}`}
          onClick={() => void deleteElements({ nodes: [{ id }] })}
        >
          <TrashIcon />
        </Button>
      </header>
      <div className="py-3">
        <p className="px-4 pb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Inputs
        </p>
        {step?.input.fields.map((field) => {
          const connected = connections.some(
            (connection) => connection.targetHandle === `input:${field.name}`,
          );
          const value = data.input[field.name];
          const fieldId = `${id}-${field.name}`;
          return (
            <div key={field.name} className="relative space-y-1.5 px-4 py-2">
              <Handle
                type="target"
                position={Position.Left}
                id={`input:${field.name}`}
                isConnectable={!connected}
                aria-label={`${field.label} input (${field.type})`}
                className="!size-3 !border-background !bg-primary"
              />
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={fieldId} className="text-xs">
                  {field.label}
                  {field.required && " *"}
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {field.type}
                </span>
              </div>
              <div className="nodrag nowheel">
                {field.type === "select" ? (
                  <Select
                    value={
                      typeof value === "string" && value ? value : "__unset"
                    }
                    disabled={connected}
                    onValueChange={(next) =>
                      changeInput(
                        field.name,
                        next === "__unset" ? undefined : next,
                      )
                    }
                  >
                    <SelectTrigger
                      id={fieldId}
                      className="w-full"
                      aria-label={field.label}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__unset">Select an option</SelectItem>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "boolean" ? (
                  <div className="flex h-8 items-center gap-2">
                    <Checkbox
                      id={fieldId}
                      checked={value === true}
                      disabled={connected}
                      onCheckedChange={(checked) =>
                        changeInput(field.name, checked === true)
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {value === true ? "True" : "False"}
                    </span>
                  </div>
                ) : (
                  <Input
                    id={fieldId}
                    type={field.type === "number" ? "number" : "text"}
                    step="any"
                    value={
                      typeof value === "string" || typeof value === "number"
                        ? value
                        : ""
                    }
                    disabled={connected}
                    placeholder={
                      connected ? "From connected output" : field.label
                    }
                    onChange={(event) =>
                      changeInput(
                        field.name,
                        field.type === "number"
                          ? event.target.value === ""
                            ? undefined
                            : event.target.valueAsNumber
                          : event.target.value,
                      )
                    }
                  />
                )}
              </div>
              {connected && (
                <p className="text-[10px] text-primary">
                  Connected · remove the edge to edit manually
                </p>
              )}
            </div>
          );
        })}
        {step?.input.fields.length === 0 && (
          <p className="px-4 text-xs text-muted-foreground">No inputs</p>
        )}
      </div>
      <div className="border-t py-3">
        <p className="px-4 pb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Outputs
        </p>
        {step?.output.fields.map((field) => (
          <div
            key={field.name}
            className="relative flex items-center justify-between gap-2 px-4 py-1.5 text-xs"
          >
            <span>{field.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {field.type}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={`output:${field.name}`}
              aria-label={`${field.name} output (${field.type})`}
              className="!size-3 !border-background !bg-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
