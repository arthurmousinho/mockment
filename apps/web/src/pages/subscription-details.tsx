import { EventTypeBadge } from "@/components/event-type-badge";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { SubscriptionIntervalBadge } from "@/components/subscription-interval-badge";
import { SubscriptionStatusBadge } from "@/components/subscription-status-badge";
import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { GetSubscriptionDetailsRequest } from "@/http/subscription-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { ArrowLeftIcon, StarIcon } from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useParams } from "react-router-dom";

export function SubscriptionDetailsPage() {
  const { id = "" } = useParams();
  const {
    data: subscription,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = GetSubscriptionDetailsRequest(id);

  if (isPending) return <div role="status">Loading...</div>;

  if (
    error instanceof HTTPError &&
    error.response.status === 404 &&
    !subscription
  ) {
    return <Navigate to="/404" replace />;
  }

  if (isError && !subscription) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load subscription details.
        </p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!subscription) return <Navigate to="/404" replace />;

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <StarIcon size={24} className="shrink-0" />
          <h1 className="text-xl font-medium tracking-tight">
            Subscription details
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review this subscription, billing details, and events.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Last updated: {formatDateTime(subscription.updatedAt)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/subscriptions">
              <ArrowLeftIcon size={18} />
              Back to subscriptions
            </Link>
          </Button>
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        </div>
      </div>

      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this subscription. Showing the last received data.
          Use Reload to try again.
        </div>
      )}

      <Card aria-label="Subscription details">
        <CardHeader>
          <h2 className="text-sm font-medium">Subscription details</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <span className="block text-2xl font-semibold tracking-tight">
            {formatCurrencyFromCents(
              subscription.amountInCents,
              subscription.currency,
            )}
          </span>
          <div className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
            <DetailRow label="Status">
              <SubscriptionStatusBadge status={subscription.status} />
            </DetailRow>
            <DetailRow label="Currency">{subscription.currency}</DetailRow>
            <DetailRow label="Method">
              <PaymentMethodBadge method={subscription.method} />
            </DetailRow>
            <DetailRow label="Billing interval">
              <SubscriptionIntervalBadge interval={subscription.interval} />
            </DetailRow>
            <DetailRow label="Interval count">
              {subscription.intervalCount}
            </DetailRow>
            <DetailRow label="Description">
              {subscription.description || "—"}
            </DetailRow>
            <DetailRow label="Next billing at">
              {subscription.nextBillingAt
                ? formatDateTime(subscription.nextBillingAt)
                : "Not scheduled"}
            </DetailRow>
            <DetailRow label="Created at">
              {formatDateTime(subscription.createdAt)}
            </DetailRow>
            <DetailRow label="Updated at">
              {formatDateTime(subscription.updatedAt)}
            </DetailRow>
          </div>
        </CardContent>
      </Card>

      <Card aria-label="References">
        <CardHeader>
          <h2 className="text-sm font-medium">References</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Subscription ID" value={subscription.id} />
          <CopyableField label="Customer ID" value={subscription.customerId} />
          <CopyableField label="API key ID" value={subscription.apiKeyId} />
        </CardContent>
      </Card>
      <Card aria-label="Events">
        <CardHeader>
          <h2 className="text-sm font-medium">Events</h2>
        </CardHeader>
        <CardContent>
          {subscription.events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No events found.
            </p>
          ) : (
            <ol>
              {subscription.events.map((event, index) => (
                <li
                  key={event.id}
                  className="relative flex items-center gap-3 pb-4 last:pb-0"
                >
                  {index < subscription.events.length - 1 && (
                    <span
                      className="absolute left-1.25 top-4 h-full w-px bg-border"
                      aria-hidden
                    />
                  )}
                  <span className="z-10 size-2.75 shrink-0 rounded-full border-2 border-background bg-muted-foreground" />
                  <div className="flex flex-wrap items-center gap-2">
                    <EventTypeBadge type={event.type} />
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
