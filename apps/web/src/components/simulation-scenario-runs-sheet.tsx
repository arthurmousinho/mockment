import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Paginator } from "@/components/paginator";
import { SimulationRunStatusBadge } from "@/components/simulation-run-status-badge";
import {
  FindSimulationScenarioRunsRequest,
  type SimulationScenario,
} from "@/http/simulations-http";
import { formatDateTime } from "@/lib/formatters";

export function SimulationScenarioRunsSheet({
  scenario,
  children,
}: {
  scenario: SimulationScenario;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data, isPending, isError, refetch } =
    FindSimulationScenarioRunsRequest(
      scenario.id,
      { page, limit },
      { enabled: open },
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="gap-0 overflow-hidden data-[side=right]:sm:max-w-3xl data-[side=right]:xl:max-w-[60vw]">
        <SheetHeader>
          <SheetTitle>Scenario Runs</SheetTitle>
          <SheetDescription>Run history for {scenario.name}.</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-4 sm:px-4">
          {isPending ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading runs...
            </p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <p className="text-sm text-muted-foreground">
                Failed to load runs.
              </p>
              <Button onClick={() => refetch()}>Try again</Button>
            </div>
          ) : (
            <>
              <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>
                          <SheetClose asChild>
                            <Link
                              to={`/simulations/runs/${run.id}`}
                              target="_blank"
                              className="underline underline-offset-4"
                            >
                              {run.id}
                            </Link>
                          </SheetClose>
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
                    ))}
                    {data.data.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-10 text-center text-muted-foreground"
                        >
                          No runs found for this scenario.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <footer className="shrink-0 border-t pt-3">
                <Paginator
                  pagination={data.pagination}
                  onPageChange={setPage}
                  onLimitChange={(value) => {
                    setLimit(value);
                    setPage(1);
                  }}
                />
              </footer>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
