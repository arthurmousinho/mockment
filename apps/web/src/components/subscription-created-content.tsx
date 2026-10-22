import type { CreateSubscriptionResponse } from "@/http/subscription-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { PaymentMethodBadge } from "./payment-method-badge";
import { SubscriptionIntervalBadge } from "./subscription-interval-badge";
import { SubscriptionStatusBadge } from "./subscription-status-badge";
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

export function SubscriptionCreatedContent({
  subscription,
}: {
  subscription: CreateSubscriptionResponse;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Subscription created</DialogTitle>
        <DialogDescription>
          Complete the initial payment through checkout to activate this
          subscription.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-2xl font-semibold tracking-tight">
            {formatCurrencyFromCents(
              subscription.amountInCents,
              subscription.currency,
            )}
          </span>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>
        <div className="space-y-2.5">
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
            <span className="break-all">{subscription.description || "—"}</span>
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
        <Separator />
        <div className="space-y-2.5 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Subscription ID" value={subscription.id} />
          <CopyableField
            label="Initial payment ID"
            value={subscription.initPaymentId}
          />
          <CopyableField label="API key ID" value={subscription.apiKeyId} />
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
            href={subscription.checkoutLink}
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
