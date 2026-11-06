import { useState, type ReactNode } from "react";
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
import { DetailRow } from "@/components/ui/detail-row";
import type { SimulationScenario } from "@/http/simulations-http";
import { formatDateTime } from "@/lib/formatters";

function ScenarioDetails({ scenario }: { scenario: SimulationScenario }) {
  return (
    <div className="min-w-0 space-y-6">
      <div className="space-y-2.5 wrap-break-word">
        <DetailRow label="ID">{scenario.id}</DetailRow>
        <DetailRow label="Name">{scenario.name}</DetailRow>
        <DetailRow label="Description">{scenario.description || "—"}</DetailRow>
        <DetailRow label="Step interval">
          {scenario.stepIntervalMs ? `${scenario.stepIntervalMs} ms` : "—"}
        </DetailRow>
        <DetailRow label="Created at">
          {formatDateTime(scenario.createdAt)}
        </DetailRow>
        <DetailRow label="Updated at">
          {formatDateTime(scenario.updatedAt)}
        </DetailRow>
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium">
            Steps ({scenario.steps.length})
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {scenario.steps.map((step, index) => (
              <li key={index}>
                {step.name} <span className="text-xs">({step.action})</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function SimulationScenarioDetailsDialog({
  scenario,
  children,
}: {
  scenario: SimulationScenario;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Scenario details</DialogTitle>
          <DialogDescription>
            Scenario information and configured steps.
          </DialogDescription>
        </DialogHeader>
        {open && <ScenarioDetails scenario={scenario} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
