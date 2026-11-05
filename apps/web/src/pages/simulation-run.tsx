import { SimulationRunStatusBadge } from "@/components/simulation-run-status-badge";
import { RefetchButton } from "@/components/refetch-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DetailRow } from "@/components/ui/detail-row";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JsonViewer } from "@/components/ui/json-viewer";
import { SimulationTimelineProgress } from "@/components/simulation-timeline-progress";
import {
  type SimulationScenario,
  FindSimulationRunRequest,
} from "@/http/simulations-http";
import { formatDateTime, formatDuration } from "@/lib/formatters";
import { ArrowLeftIcon, FlaskIcon } from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";

export function SimulationRunPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const { scenario } = (location.state ?? {}) as {
    scenario?: SimulationScenario;
  };

  const {
    data: run,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = FindSimulationRunRequest(id);

  if (isPending) {
    return <div role="status">Loading...</div>;
  }

  if (error instanceof HTTPError && error.response.status === 404) {
    return <Navigate to="/404" replace />;
  }

  if (isError && !run) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load simulation run.
        </p>

        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!run) {
    return <Navigate to="/404" replace />;
  }

  const delay =
    scenario?.id === run.scenarioId ? scenario.stepIntervalMs : undefined;
  const active = run.status === "PENDING" || run.status === "RUNNING";
  const executed = run.steps.filter(
    (step) => step.status === "COMPLETED" || step.status === "FAILED",
  ).length;
  const skipped = run.steps.filter((step) => step.status === "SKIPPED").length;

  return (
    <div className="min-w-0 space-y-4">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <FlaskIcon size={24} className="font-medium" />
            <h1 className="text-xl font-medium tracking-tight">
              Simulation run
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            Review execution status, step details, and results.
          </p>
        </div>
      </header>

      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span role="status" className="text-sm text-muted-foreground">
          Last updated: {formatDateTime(run.updatedAt)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/simulations">
              <ArrowLeftIcon size={18} />
              Back to scenarios
            </Link>
          </Button>
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        </div>
      </header>

      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this run. Showing the last received data. Use Reload
          to try again.
        </div>
      )}

      <Card aria-label="Execution details">
        <CardHeader>
          <h2 className="text-sm font-medium">Execution details</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="min-w-0 space-y-2.5 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
            <DetailRow label="Scenario ID">{run.scenarioId}</DetailRow>
            <DetailRow label="Run ID">
              <span className="break-all">{run.id}</span>
            </DetailRow>
            <DetailRow label="Steps executed">
              {executed} / {run.totalSteps}
              {skipped > 0 && ` (${skipped} skipped)`}
            </DetailRow>
            <DetailRow label="Started at">
              {run.startedAt ? formatDateTime(run.startedAt) : "Not started"}
            </DetailRow>
            <DetailRow label="Created at">
              {formatDateTime(run.createdAt)}
            </DetailRow>
          </div>
          <Separator orientation="vertical" className="hidden lg:block" />
          <div className="min-w-0 space-y-2.5 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
            <DetailRow label="Status">
              <SimulationRunStatusBadge status={run.status} />
            </DetailRow>
            <DetailRow label="Duration">
              {formatDuration(run.startedAt, run.finishedAt)}
            </DetailRow>
            <DetailRow label="Finished at">
              {run.finishedAt ? formatDateTime(run.finishedAt) : "—"}
            </DetailRow>
            <DetailRow label="Updated at">
              {formatDateTime(run.updatedAt)}
            </DetailRow>
          </div>
        </CardContent>
      </Card>

      {run.error != null && <JsonViewer label="Run error" value={run.error} />}

      <Card aria-label="Execution timeline">
        <CardHeader>
          <h2 className="text-sm font-medium">Execution timeline</h2>
        </CardHeader>
        <CardContent>
          {!run.steps.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {active
                ? "No step execution records yet. Waiting for execution data."
                : "No step execution records found."}
            </p>
          ) : (
            <Accordion type="multiple" className="ml-2.5 pl-10">
              {run.steps.map((step, index) => (
                <AccordionItem
                  key={step.id}
                  value={step.id}
                  className="relative border-0"
                >
                  <SimulationTimelineProgress
                    step={step}
                    nextStep={run.steps[index + 1]}
                    runStatus={run.status}
                    delay={delay}
                  />
                  <AccordionTrigger className="min-h-11 gap-3 py-2.5 hover:no-underline">
                    <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
                      <span className="space-y-1">
                        <span className="block">Step {step.stepIndex + 1}</span>
                        {run.status === "RUNNING" &&
                          step.status === "COMPLETED" &&
                          run.steps[index + 1]?.status === "PENDING" && (
                            <span
                              className="block text-xs font-normal text-muted-foreground"
                              role="status"
                            >
                              Waiting for next step…
                            </span>
                          )}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(step.startedAt, step.finishedAt)}
                        </span>
                        <SimulationRunStatusBadge
                          status={step.status}
                          animate={active}
                        />
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-6">
                    <div className="grid gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
                      <DetailRow label="Step run ID">
                        <span className="break-all">{step.id}</span>
                      </DetailRow>
                      <DetailRow label="Step type">Not provided</DetailRow>
                      <DetailRow label="Status">
                        <SimulationRunStatusBadge
                          status={step.status}
                          animate={active}
                        />
                      </DetailRow>
                      <DetailRow label="Started">
                        {step.startedAt
                          ? formatDateTime(step.startedAt)
                          : "Not started"}
                      </DetailRow>
                      <DetailRow label="Finished">
                        {step.finishedAt
                          ? formatDateTime(step.finishedAt)
                          : "—"}
                      </DetailRow>
                      <DetailRow label="Duration">
                        {formatDuration(step.startedAt, step.finishedAt)}
                      </DetailRow>
                      <DetailRow label="Created">
                        {formatDateTime(step.createdAt)}
                      </DetailRow>
                      <DetailRow label="Last updated">
                        {formatDateTime(step.updatedAt)}
                      </DetailRow>
                    </div>
                    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                      <JsonViewer label="Inputs" value={step.input} />
                      <JsonViewer label="Outputs" value={step.output} />
                    </div>
                    {step.error != null && (
                      <JsonViewer label="Step error" value={step.error} />
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
