import { EventTypeBadge } from "@/components/event-type-badge";
import { JsonViewer } from "@/components/ui/json-viewer";
import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { GetEventDetailsRequest } from "@/http/events-http";
import { formatDateTime } from "@/lib/formatters";
import { ArrowLeftIcon, ReceiptIcon } from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useParams } from "react-router-dom";

export function EventDetailsPage() {
  const { id = "" } = useParams();
  const {
    data: event,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = GetEventDetailsRequest(id);

  if (isPending) return <div role="status">Loading...</div>;

  if (error instanceof HTTPError && error.response.status === 404 && !event) {
    return <Navigate to="/404" replace />;
  }

  if (isError && !event) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load event details.
        </p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!event) return <Navigate to="/404" replace />;

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <ReceiptIcon size={24} className="shrink-0" />
          <h1 className="text-xl font-medium tracking-tight">Event details</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review this event and its payload.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Created at: {formatDateTime(event.createdAt)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/events">
              <ArrowLeftIcon size={18} />
              Back to events
            </Link>
          </Button>
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        </div>
      </div>

      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this event. Showing the last received data. Use
          Reload to try again.
        </div>
      )}

      <Card aria-label="Event details">
        <CardHeader>
          <h2 className="text-sm font-medium">Event details</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
          <DetailRow label="Type">
            <EventTypeBadge type={event.type} />
          </DetailRow>
          <DetailRow label="Created at">
            {formatDateTime(event.createdAt)}
          </DetailRow>
        </CardContent>
      </Card>

      <Card aria-label="References">
        <CardHeader>
          <h2 className="text-sm font-medium">References</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Event ID" value={event.id} />
          {event.paymentId && (
            <CopyableField label="Payment ID" value={event.paymentId} />
          )}
          {event.subscriptionId && (
            <CopyableField
              label="Subscription ID"
              value={event.subscriptionId}
            />
          )}
        </CardContent>
      </Card>
      <JsonViewer label="Payload" value={event.payload} />
    </div>
  );
}
