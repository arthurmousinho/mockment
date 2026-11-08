import { useState, type ReactNode } from "react";
import { GetInvoiceDetailsRequest } from "@/http/invoices-http";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { EventTypeBadge } from "@/components/event-type-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";

export function InvoiceDetailsDialog({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const {
    data: invoice,
    isPending,
    isError,
    isFetching,
    refetch,
  } = GetInvoiceDetailsRequest(id, { enabled: open });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invoice details</DialogTitle>
          <DialogDescription>
            Full information about this invoice.
          </DialogDescription>
        </DialogHeader>
        {isPending && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-36" />
            <Separator />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        )}
        {isError && (
          <div className="space-y-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Failed to load invoice details.
            </p>
            <Button disabled={isFetching} onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}
        {invoice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-semibold tracking-tight">
                {formatCurrencyFromCents(
                  invoice.amountInCents,
                  invoice.currency,
                )}
              </span>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <Separator />
            <div className="space-y-2.5">
              <DetailRow label="Customer">{invoice.customerName}</DetailRow>
              <DetailRow label="Tax ID">
                {invoice.customerTaxId ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>
              <DetailRow label="Currency">{invoice.currency}</DetailRow>
            </div>
            <Separator />
            <div className="space-y-2.5">
              <CopyableField label="Invoice ID" value={invoice.id} />
              <CopyableField label="Payment ID" value={invoice.paymentId} />
            </div>
            <Separator />
            <div className="space-y-2.5">
              <DetailRow label="Issued at">
                {invoice.issuedAt ? (
                  formatDateTime(invoice.issuedAt)
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>
              <DetailRow label="Created at">
                {formatDateTime(invoice.createdAt)}
              </DetailRow>
              <DetailRow label="Updated at">
                {formatDateTime(invoice.updatedAt)}
              </DetailRow>
            </div>
            <Separator />
            <div className="space-y-3">
              <span className="text-sm text-muted-foreground">Events</span>
              {invoice.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events found.</p>
              ) : (
                <ol className="space-y-0 mt-2">
                  {invoice.events.map((event, index) => {
                    const isLast = index === invoice.events.length - 1;
                    return (
                      <li key={event.id} className="relative flex items-center gap-3 pb-4 last:pb-0">
                        {!isLast && (
                          <span className="absolute left-1.25 top-4 h-full w-px bg-border" aria-hidden />
                        )}
                        <span className="z-10 size-2.75 shrink-0 rounded-full border-2 border-background bg-muted-foreground" />
                        <div className="flex flex-row gap-1 items-center text-muted-foreground">
                          <EventTypeBadge type={event.type} />
                          <span className="text-xs text-muted-foreground">• {formatDateTime(event.createdAt)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
