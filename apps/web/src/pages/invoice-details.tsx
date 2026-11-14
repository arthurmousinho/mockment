import { EventTypeBadge } from "@/components/event-type-badge";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import {
  DownloadInvoicePdfRequest,
  GetInvoiceDetailsRequest,
} from "@/http/invoices-http";
import { GetCustomerDetailsRequest } from "@/http/customers-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import {
  ArrowLeftIcon,
  DownloadSimpleIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useParams } from "react-router-dom";

export function InvoiceDetailsPage() {
  const { id = "" } = useParams();
  const {
    data: invoice,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = GetInvoiceDetailsRequest(id);
  const { data: customer } = GetCustomerDetailsRequest(
    invoice?.customerId ?? "",
    {
      enabled: Boolean(invoice?.customerId),
    },
  );
  const { mutate: downloadInvoicePdf, isPending: isDownloading } =
    DownloadInvoicePdfRequest();

  if (isPending) return <div role="status">Loading...</div>;

  if (error instanceof HTTPError && error.response.status === 404 && !invoice) {
    return <Navigate to="/404" replace />;
  }

  if (isError && !invoice) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load invoice details.
        </p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!invoice) return <Navigate to="/404" replace />;

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <ReceiptIcon size={24} className="shrink-0" />
          <h1 className="text-xl font-medium tracking-tight">
            Invoice details
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review this invoice, its customer, and its events.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Last updated: {formatDateTime(invoice.updatedAt)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/invoices">
              <ArrowLeftIcon size={18} />
              Back to invoices
            </Link>
          </Button>
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
          <Button
            disabled={invoice.status !== "ISSUED" || isDownloading}
            onClick={() => downloadInvoicePdf(invoice.id)}
          >
            <DownloadSimpleIcon size={18} />
            Download PDF
          </Button>
        </div>
      </div>

      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this invoice. Showing the last received data. Use
          Reload to try again.
        </div>
      )}

      <Card aria-label="Invoice details">
        <CardHeader>
          <h2 className="text-sm font-medium">Invoice details</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <span className="text-2xl font-semibold tracking-tight block">
            {formatCurrencyFromCents(invoice.amountInCents, invoice.currency)}
          </span>
          <div className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
            <DetailRow label="Status">
              <InvoiceStatusBadge status={invoice.status} />
            </DetailRow>
            <DetailRow label="Customer">
              {customer?.name ?? invoice.customerId}
            </DetailRow>
            <DetailRow label="Currency">{invoice.currency}</DetailRow>
            <DetailRow label="Tax ID">{customer?.document ?? "—"}</DetailRow>
            <DetailRow label="Issued at">
              {invoice.issuedAt ? formatDateTime(invoice.issuedAt) : "—"}
            </DetailRow>
            <DetailRow label="Created at">
              {formatDateTime(invoice.createdAt)}
            </DetailRow>
            <DetailRow label="Updated at">
              {formatDateTime(invoice.updatedAt)}
            </DetailRow>
          </div>
        </CardContent>
      </Card>

      <Card aria-label="References">
        <CardHeader>
          <h2 className="text-sm font-medium">References</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Invoice ID" value={invoice.id} />
          <CopyableField label="Payment ID" value={invoice.paymentId} />
        </CardContent>
      </Card>

      <Card aria-label="Events">
        <CardHeader>
          <h2 className="text-sm font-medium">Events</h2>
        </CardHeader>
        <CardContent>
          {invoice.events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No events found.
            </p>
          ) : (
            <ol>
              {invoice.events.map((event, index) => (
                <li
                  key={event.id}
                  className="relative flex items-center gap-3 pb-4 last:pb-0"
                >
                  {index < invoice.events.length - 1 && (
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
