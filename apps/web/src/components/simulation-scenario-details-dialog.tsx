import { useState, type ReactNode } from "react";
import "@xyflow/react/dist/style.css";
import { Link } from "react-router-dom";
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
import { Paginator } from "@/components/paginator";
import { SimulationRunStatusBadge } from "@/components/simulation-run-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type SimulationScenario,
  FindSimulationScenarioRunsRequest,
} from "@/http/simulations-http";
import { formatDateTime } from "@/lib/formatters";

function ScenarioDetails({ scenario }: { scenario: SimulationScenario }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const runs = FindSimulationScenarioRunsRequest(scenario.id, { page, limit });

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
      <section className="min-w-0 space-y-3">
        <h3 className="text-sm font-medium">Runs</h3>
        {runs.isPending ? (
          <p className="text-sm text-muted-foreground">Loading runs...</p>
        ) : runs.isError ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Failed to load runs.
            </p>
            <Button variant="outline" onClick={() => runs.refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted/70">
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.data.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No runs found for this scenario.
                    </TableCell>
                  </TableRow>
                ) : (
                  runs.data.data.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>
                        <DialogClose asChild>
                          <Link
                            to={`/simulations/runs/${run.id}`}
                            state={{ scenario }}
                            className="underline underline-offset-4"
                          >
                            {run.id}
                          </Link>
                        </DialogClose>
                      </TableCell>
                      <TableCell>
                        <SimulationRunStatusBadge status={run.status} />
                      </TableCell>
                      <TableCell>
                        {run.currentStep} / {run.totalSteps}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(run.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Paginator
              pagination={runs.data.pagination}
              onPageChange={setPage}
              onLimitChange={(value) => {
                setLimit(value);
                setPage(1);
              }}
            />
          </>
        )}
      </section>
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
            Scenario information and run history.
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
