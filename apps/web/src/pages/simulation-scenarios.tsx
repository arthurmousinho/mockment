import { useState } from "react";
import { DotsThreeIcon, FlaskIcon, PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { Paginator } from "@/components/paginator";
import { ListingSearch } from "@/components/listing-search";
import { RefetchButton } from "@/components/refetch-button";
import { SimulationScenarioFormDialog } from "@/components/simulation-scenario-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FindAllSimulationScenariosRequest } from "@/http/simulation-scenarios-http";
import { formatDateTime } from "@/lib/formatters";

export function SimulationScenariosPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data, isPending, isFetching, isError, refetch } =
    FindAllSimulationScenariosRequest({ page, limit, search });

  if (isPending) return <div>Loading simulation scenarios...</div>;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load simulation scenarios.
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FlaskIcon size={24} className="font-medium" />
          <h1 className="text-xl font-medium tracking-tight">Simulation scenarios</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Build payment flows visually by connecting step outputs to inputs.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ListingSearch
          className="min-w-0 flex-[1_1_30rem]"
          value={searchInput}
          appliedValue={search}
          onValueChange={setSearchInput}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          label="Search simulation scenarios"
          inputLabel="Simulation scenario name or description"
          placeholder="Search by name or description..."
        />
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
          <SimulationScenarioFormDialog>
            <Button>
              <PlusIcon size={18} />
              New Scenario
            </Button>
          </SimulationScenarioFormDialog>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Steps</TableHead>
            <TableHead className="text-right">Delay</TableHead>
            <TableHead className="text-right">Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {search
                  ? "No simulation scenarios match your search."
                  : "No simulation scenarios found. Create one to get started."}
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((scenario) => (
              <TableRow key={scenario.id}>
                <TableCell className="font-medium">{scenario.name}</TableCell>
                <TableCell className="max-w-80 truncate">
                  {scenario.description || "—"}
                </TableCell>
                <TableCell className="text-right">{scenario.steps.length}</TableCell>
                <TableCell className="text-right">
                  {scenario.stepIntervalMs ? `${scenario.stepIntervalMs} ms` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {formatDateTime(scenario.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="Scenario options">
                        <DotsThreeIcon size={32} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right">
                      <SimulationScenarioFormDialog scenario={scenario}>
                        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                          <PencilSimpleIcon size={20} />
                          Edit
                        </DropdownMenuItem>
                      </SimulationScenarioFormDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Paginator
        pagination={data.pagination}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
