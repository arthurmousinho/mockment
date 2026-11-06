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
import { ListingSearch } from "@/components/listing-search";
import { Paginator } from "@/components/paginator";
import { RefetchButton } from "@/components/refetch-button";
import { SimulationRunStatusBadge } from "@/components/simulation-run-status-badge";
import { FindAllSimulationRunsRequest } from "@/http/simulations-http";
import { formatDateTime } from "@/lib/formatters";

export function SimulationRunsSheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data, isPending, isFetching, isError, refetch } =
    FindAllSimulationRunsRequest({ page, limit, search }, { enabled: open });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="gap-0 overflow-hidden data-[side=right]:sm:max-w-3xl data-[side=right]:xl:max-w-[60vw]">
        <SheetHeader>
          <SheetTitle>All Simulation Runs</SheetTitle>
          <SheetDescription>
            Run history across all simulation scenarios.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-4 sm:px-4">
          <div className="flex shrink-0 flex-wrap items-center gap-2 pb-4">
            <ListingSearch
              className="min-w-0 flex-1"
              value={searchInput}
              appliedValue={search}
              onValueChange={setSearchInput}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              label="Search simulation runs"
              inputLabel="Run ID, scenario ID, scenario name, or status"
              placeholder="Search by ID, scenario, or status..."
            />
            <RefetchButton
              isFetching={isFetching}
              onRefetch={() => refetch()}
            />
          </div>

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
                      <TableHead>Scenario</TableHead>
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
                        <TableCell
                          className="max-w-60 truncate"
                          title={run.scenario.name}
                        >
                          {run.scenario.name}
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
                          colSpan={5}
                          className="py-10 text-center text-muted-foreground"
                        >
                          {search
                            ? "No runs match your search."
                            : "No runs found."}
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
