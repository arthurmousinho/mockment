import { EventTypeBadge } from "@/components/event-type-badge";
import { PaymentCurrencyBadge } from "@/components/payment-currency-badge";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { GetPaymentDetailsRequest } from "@/http/payments-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  CurrencyCircleDollarIcon,
} from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useParams } from "react-router-dom";

export function PaymentDetailsPage() {
  const { id = "" } = useParams();
  const {
    data: payment,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = GetPaymentDetailsRequest(id);

  if (isPending) return <div role="status">Loading...</div>;

  if (error instanceof HTTPError && error.response.status === 404 && !payment) {
    return <Navigate to="/404" replace />;
  }

  if (isError && !payment) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load payment details.
        </p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!payment) return <Navigate to="/404" replace />;

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <CurrencyCircleDollarIcon size={24} className="shrink-0" />
          <h1 className="text-xl font-medium tracking-tight">
            Payment details
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review this payment, its checkout, and its events.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Last updated: {formatDateTime(payment.updatedAt)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/payments">
              <ArrowLeftIcon size={18} />
              Back to payments
            </Link>
          </Button>
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
          {payment.checkoutLink && (
            <Button asChild>
              <a
                href={payment.checkoutLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ArrowSquareOutIcon size={18} />
                Open checkout
              </a>
            </Button>
          )}
        </div>
      </div>

      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this payment. Showing the last received data. Use
          Reload to try again.
        </div>
      )}

      <Card aria-label="Payment details">
        <CardHeader>
          <h2 className="text-sm font-medium">Payment details</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <span className="text-2xl font-semibold tracking-tight block">
            {formatCurrencyFromCents(payment.amountInCents, payment.currency)}
          </span>
          <div className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
            <DetailRow label="Status">
              <PaymentStatusBadge status={payment.status} />
            </DetailRow>
            <DetailRow label="Description">
              {payment.description ?? "—"}
            </DetailRow>
            <DetailRow label="Currency">
              <PaymentCurrencyBadge currency={payment.currency} />
            </DetailRow>
            <DetailRow label="Created at">
              {formatDateTime(payment.createdAt)}
            </DetailRow>
            <DetailRow label="Method">
              <PaymentMethodBadge method={payment.method} />
            </DetailRow>
            <DetailRow label="Updated at">
              {formatDateTime(payment.updatedAt)}
            </DetailRow>
          </div>
        </CardContent>
      </Card>

      <Card aria-label="References">
        <CardHeader>
          <h2 className="text-sm font-medium">References</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Payment ID" value={payment.id} />
          <CopyableField label="API Key ID" value={payment.apiKeyId} />
          {payment.customerId && (
            <CopyableField label="Customer ID" value={payment.customerId} />
          )}
          {payment.externalId && (
            <CopyableField label="External ID" value={payment.externalId} />
          )}
          {payment.idempotencyKey && (
            <CopyableField
              label="Idempotency Key"
              value={payment.idempotencyKey}
            />
          )}
          {payment.checkoutId && (
            <CopyableField label="Checkout ID" value={payment.checkoutId} />
          )}
          {payment.checkoutLink && (
            <CopyableField label="Checkout link" value={payment.checkoutLink} />
          )}
          {!payment.checkoutLink && (
            <p className="text-sm text-muted-foreground">
              No checkout available.
            </p>
          )}
        </CardContent>
      </Card>

      <Card aria-label="Events">
        <CardHeader>
          <h2 className="text-sm font-medium">Events</h2>
        </CardHeader>
        <CardContent>
          {payment.events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No events found.
            </p>
          ) : (
            <ol>
              {payment.events.map((event, index) => (
                <li
                  key={event.id}
                  className="relative flex items-center gap-3 pb-4 last:pb-0"
                >
                  {index < payment.events.length - 1 && (
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
