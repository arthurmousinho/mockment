import type { CreatePaymentResponse } from "@/http/payments-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { PaymentMethodBadge } from "./payment-method-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import { Button } from "./ui/button";
import { CopyableField } from "./ui/copyable-field";
import { DetailRow } from "./ui/detail-row";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";

export function PaymentCreatedContent({
  payment,
}: {
  payment: CreatePaymentResponse;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Payment created</DialogTitle>
        <DialogDescription>
          Open checkout to complete this payment.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-2xl font-semibold tracking-tight">
            {formatCurrencyFromCents(payment.amountInCents, payment.currency)}
          </span>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <div className="space-y-2.5">
          <DetailRow label="Currency">{payment.currency}</DetailRow>
          <DetailRow label="Method">
            <PaymentMethodBadge method={payment.method} />
          </DetailRow>
          <DetailRow label="Description">
            <span className="break-all">{payment.description || "—"}</span>
          </DetailRow>
          <DetailRow label="Created at">
            {formatDateTime(payment.createdAt)}
          </DetailRow>
        </div>
        <Separator />
        <div className="space-y-2.5 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Payment ID" value={payment.id} />
          {payment.externalId && (
            <CopyableField label="External ID" value={payment.externalId} />
          )}
          {payment.idempotencyKey && (
            <CopyableField
              label="Idempotency key"
              value={payment.idempotencyKey}
            />
          )}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Done
          </Button>
        </DialogClose>
        <Button asChild>
          <a
            href={payment.checkoutLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open checkout page
          </a>
        </Button>
      </DialogFooter>
    </>
  );
}
