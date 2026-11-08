import { useState, type ReactNode } from "react";
import { GetInvoiceDetailsRequest } from "@/http/invoices-http";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
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
      <DialogContent className="sm:max-w-md">
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
