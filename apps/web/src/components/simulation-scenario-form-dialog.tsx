import { useState, type ReactNode } from "react";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { CreateSimulationScenarioRequest } from "@/http/create-simulation-scenario-http";

const stepsSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(100),
    action: z.string().trim().min(1).max(80),
    input: z.record(z.string(), z.unknown()).optional(),
  }),
).min(1).max(100);

const initialSteps = `[
  {
    "name": "Create a payment",
    "action": "CREATE_PAYMENT",
    "input": {
      "amountInCents": 5000,
      "currency": "BRL",
      "method": "PIX"
    }
  }
]`;

export function SimulationScenarioFormDialog({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stepIntervalMs, setStepIntervalMs] = useState("");
  const [stepsText, setStepsText] = useState(initialSteps);
  const [stepsError, setStepsError] = useState<string | null>(null);
  const createScenario = CreateSimulationScenarioRequest();

  function resetForm() {
    setName("");
    setDescription("");
    setStepIntervalMs("");
    setStepsText(initialSteps);
    setStepsError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let parsedSteps: unknown;
    try {
      parsedSteps = JSON.parse(stepsText);
    } catch {
      setStepsError("Enter valid JSON for the ordered scenario steps.");
      return;
    }

    const validation = stepsSchema.safeParse(parsedSteps);
    if (!validation.success) {
      setStepsError("Steps must be an array with a name and action for each step.");
      return;
    }
    setStepsError(null);

    const interval = stepIntervalMs.trim() ? Number(stepIntervalMs) : null;
    if (interval !== null && (!Number.isInteger(interval) || interval < 1 || interval > 60_000)) {
      setStepsError("Step interval must be between 1 and 60000 milliseconds.");
      return;
    }

    createScenario.mutate(
      {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        stepIntervalMs: interval,
        steps: validation.data,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create simulation scenario</DialogTitle>
          <DialogDescription>
            Save an ordered scenario definition with optional input data for each step.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="scenario-name">Name</Label>
            <Input
              id="scenario-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
              placeholder="Successful payment flow"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scenario-description">Description</Label>
            <Textarea
              id="scenario-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              placeholder="What does this scenario demonstrate?"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scenario-interval">Delay between steps (ms)</Label>
            <Input
              id="scenario-interval"
              type="number"
              min={1}
              max={60000}
              value={stepIntervalMs}
              onChange={(event) => setStepIntervalMs(event.target.value)}
              placeholder="No delay"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scenario-steps">Steps (JSON)</Label>
            <Textarea
              id="scenario-steps"
              value={stepsText}
              onChange={(event) => setStepsText(event.target.value)}
              className="min-h-52 font-mono text-xs"
              spellCheck={false}
              aria-invalid={Boolean(stepsError)}
            />
            <p className="text-xs text-muted-foreground">
              Use an array of steps. Each step needs a name and action; input is optional.
            </p>
            {stepsError && <p role="alert" className="text-xs text-destructive">{stepsError}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={createScenario.isPending}>
              {createScenario.isPending ? "Saving…" : "Create scenario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
