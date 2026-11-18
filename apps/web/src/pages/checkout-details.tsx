import { CheckoutStatusBadge } from "@/components/checkout-status-badge";
import { EventTypeBadge } from "@/components/event-type-badge";
import { PaymentCurrencyBadge } from "@/components/payment-currency-badge";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { GetCheckoutDetailsRequest } from "@/http/checkout-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  LinkSimpleIcon,
} from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useParams } from "react-router-dom";

export function CheckoutDetailsPage() {
  const { id = "" } = useParams();
  const {
    data: checkout,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = GetCheckoutDetailsRequest(id);

  if (isPending) return <div role="status">Loading...</div>;
  if (
    error instanceof HTTPError &&
    error.response.status === 404 &&
    !checkout
  ) {
    return <Navigate to="/404" replace />;
  }
  if (isError && !checkout) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load checkout details.
        </p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  if (!checkout) return <Navigate to="/404" replace />;

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <LinkSimpleIcon size={24} className="shrink-0" />
          <h1 className="text-xl font-medium tracking-tight">
            Checkout details
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review this checkout, its references, and events.
        </p>
      </header>
      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild variant="outline">
          <Link to="/checkouts">
            <ArrowLeftIcon size={18} />
            Back to checkouts
          </Link>
        </Button>
        <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        <Button asChild>
          <Link
            to={`/checkout/${checkout.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowSquareOutIcon size={18} />
            Open Session
          </Link>
        </Button>
      </div>
      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this checkout. Showing the last received data. Use
          Reload to try again.
        </div>
      )}
      <Card aria-label="Checkout details">
        <CardHeader>
          <h2 className="text-sm font-medium">Checkout details</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <span className="block text-2xl font-semibold tracking-tight">
            {formatCurrencyFromCents(checkout.amountInCents, checkout.currency)}
          </span>
          <div className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
            <DetailRow label="Status">
              <CheckoutStatusBadge status={checkout.status} />
            </DetailRow>
            <DetailRow label="Currency">
              <PaymentCurrencyBadge currency={checkout.currency} />
            </DetailRow>
            <DetailRow label="Allowed methods">
              <div className="flex flex-wrap gap-1">
                {checkout.allowedMethods.map((method) => (
                  <PaymentMethodBadge key={method} method={method} />
                ))}
              </div>
            </DetailRow>
            <DetailRow label="Created at">
              {formatDateTime(checkout.createdAt)}
            </DetailRow>
            <DetailRow label="Expires at">
              {checkout.expiresAt ? formatDateTime(checkout.expiresAt) : "—"}
            </DetailRow>
            <DetailRow label="Completed at">
              {checkout.completedAt
                ? formatDateTime(checkout.completedAt)
                : "—"}
            </DetailRow>
          </div>
        </CardContent>
      </Card>
      <Card aria-label="References">
        <CardHeader>
          <h2 className="text-sm font-medium">References</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Checkout ID" value={checkout.id} />
          {checkout.customerId && (
            <CopyableField label="Customer ID" value={checkout.customerId} />
          )}
          {checkout.paymentId && (
            <CopyableField label="Payment ID" value={checkout.paymentId} />
          )}
          {checkout.subscriptionId && (
            <CopyableField
              label="Subscription ID"
              value={checkout.subscriptionId}
            />
          )}
          <CopyableField label="Success URL" value={checkout.successUrl} />
          <CopyableField label="Cancel URL" value={checkout.cancelUrl} />
        </CardContent>
      </Card>
      <Card aria-label="Events">
        <CardHeader>
          <h2 className="text-sm font-medium">Events</h2>
        </CardHeader>
        <CardContent>
          {checkout.events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No events found.
            </p>
          ) : (
            <ol>
              {checkout.events.map((event, index) => (
                <li
                  key={event.id}
                  className="relative flex items-center gap-3 pb-4 last:pb-0"
                >
                  {index < checkout.events.length - 1 && (
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
