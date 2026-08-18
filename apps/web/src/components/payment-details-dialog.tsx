import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentCurrencyBadge } from "@/components/payment-currency-badge";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { EventTypeBadge } from "@/components/event-type-badge";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { CopyableField } from "./ui/copyable-field";
import { DetailRow } from "./ui/detail-row";
import { GetPaymentDetailsRequest } from "@/http/payments-http";

type PaymentDetailsDialogProps = {
  id: string;
  children: ReactNode;
};

function PaymentDetailsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Separator />
      <div className="space-y-2.5">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
      <Separator />
      <div className="space-y-2.5">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}

export function PaymentDetailsDialog({
  id,
  children,
}: PaymentDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    data: paymentDetails,
    isPending,
    isError,
  } = GetPaymentDetailsRequest(id, { enabled: open });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment details</DialogTitle>
          <DialogDescription>
            Full information about this payment.
          </DialogDescription>
        </DialogHeader>

        {isPending && <PaymentDetailsSkeleton />}

        {isError && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Failed to load payment details.
          </p>
        )}

        {paymentDetails && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold tracking-tight">
                {formatCurrencyFromCents(
                  paymentDetails.amountInCents,
                  paymentDetails.currency,
                )}
              </span>
              <PaymentStatusBadge status={paymentDetails.status} />
            </div>
            <Separator />
            <div className="space-y-2.5">
              <DetailRow label="Currency">
                <PaymentCurrencyBadge currency={paymentDetails.currency} />
              </DetailRow>
              <DetailRow label="Method">
                <PaymentMethodBadge method={paymentDetails.method} />
              </DetailRow>
              <DetailRow label="Description">
                {paymentDetails.description ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>
            </div>
            <Separator />
            <div className="space-y-2.5">
              <CopyableField label="Payment ID" value={paymentDetails.id} />
              <CopyableField
                label="API Key ID"
                value={paymentDetails.apiKeyId}
              />
              {paymentDetails.externalId && (
                <CopyableField
                  label="External ID"
                  value={paymentDetails.externalId}
                />
              )}
              {paymentDetails.idempotencyKey && (
                <CopyableField
                  label="Idempotency Key"
                  value={paymentDetails.idempotencyKey}
                />
              )}
            </div>
            <Separator />
            <div className="space-y-2.5">
              <DetailRow label="Created at">
                {formatDateTime(paymentDetails.createdAt)}
              </DetailRow>
              <DetailRow label="Updated at">
                {formatDateTime(paymentDetails.updatedAt)}
              </DetailRow>
            </div>
            <Separator />
            <div className="space-y-3">
              <span className="text-sm text-muted-foreground">Events</span>
              <ol className="space-y-0 mt-2">
                {paymentDetails.events.map((event, index) => {
                  const isLast = index === paymentDetails.events.length - 1;
                  return (
                    <li
                      key={event.id}
                      className="relative flex items-center gap-3 pb-4 last:pb-0"
                    >
                      {!isLast && (
                        <span
                          className="absolute left-1.25 top-4 h-full w-px bg-border"
                          aria-hidden
                        />
                      )}
                      <span className="z-10 size-2.75 shrink-0 rounded-full border-2 border-background bg-muted-foreground" />
                      <div className="flex flex-row gap-1 items-center text-muted-foreground">
                        <EventTypeBadge type={event.type} />
                        <span className="text-xs text-muted-foreground">
                          • {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
