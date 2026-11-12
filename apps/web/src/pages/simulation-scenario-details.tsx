import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { GetSimulationScenarioRequest } from "@/http/simulations-http";
import { formatDateTime } from "@/lib/formatters";
import { ArrowLeftIcon, FlaskIcon } from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useParams } from "react-router-dom";

export function SimulationScenarioDetailsPage() {
  const { id = "" } = useParams();
  const {
    data: scenario,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = GetSimulationScenarioRequest(id);

  if (isPending) return <div role="status">Loading...</div>;

  if (
    error instanceof HTTPError &&
    error.response.status === 404 &&
    !scenario
  ) {
    return <Navigate to="/404" replace />;
  }

  if (isError && !scenario) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load scenario details.
        </p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!scenario) return <Navigate to="/404" replace />;

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <FlaskIcon size={24} className="shrink-0" />
          <h1 className="text-xl font-medium tracking-tight">
            Scenario details
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review this scenario and its configured steps.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Last updated: {formatDateTime(scenario.updatedAt)}
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
      </div>

      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this scenario. Showing the last received data. Use
          Reload to try again.
        </div>
      )}

      <Card aria-label="Scenario details">
        <CardHeader>
          <h2 className="text-sm font-medium">Scenario details</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
          <DetailRow label="Name">{scenario.name}</DetailRow>
          <DetailRow label="Description">
            {scenario.description || "—"}
          </DetailRow>
          <DetailRow label="Step interval">
            {scenario.stepIntervalMs != null
              ? `${scenario.stepIntervalMs} ms`
              : "—"}
          </DetailRow>
          <DetailRow label="Created at">
            {formatDateTime(scenario.createdAt)}
          </DetailRow>
          <DetailRow label="Updated at">
            {formatDateTime(scenario.updatedAt)}
          </DetailRow>
        </CardContent>
      </Card>

      <Card aria-label="References">
        <CardHeader>
          <h2 className="text-sm font-medium">References</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Scenario ID" value={scenario.id} />
        </CardContent>
      </Card>
      <Card aria-label="Steps">
        <CardHeader>
          <h2 className="text-sm font-medium">
            Steps ({scenario.steps.length})
          </h2>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {scenario.steps.map((step, index) => (
              <li key={index}>
                {step.name} <span className="text-xs">({step.action})</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
