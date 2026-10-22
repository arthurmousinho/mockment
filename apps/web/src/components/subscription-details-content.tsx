import { EventTypeBadge } from "./event-type-badge";
import type {
  CreateSubscriptionResponse,
  DetailedSubscription,
  Subscription,
} from "@/http/subscription-http";
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

export function SubscriptionDetailsContent({
  subscription,
  created = false,
}: {
  subscription: Subscription &
    Partial<
      Pick<CreateSubscriptionResponse, "initPaymentId" | "checkoutLink">
    > &
    Partial<Pick<DetailedSubscription, "events">>;
  created?: boolean;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {created ? "Subscription created" : "Subscription details"}
        </DialogTitle>
        <DialogDescription>
          {created
            ? "Complete the initial payment through checkout to activate this subscription."
            : "Full information about this subscription."}
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
          {subscription.initPaymentId && (
            <CopyableField
              label="Initial payment ID"
              value={subscription.initPaymentId}
            />
          )}
          <CopyableField label="API key ID" value={subscription.apiKeyId} />
        </div>
        {subscription.events && (
          <>
            <Separator />
            <div className="space-y-3">
              <span className="text-sm text-muted-foreground">Events</span>
              {subscription.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No events found.
                </p>
              ) : (
                <ol className="mt-2 space-y-0">
                  {subscription.events.map((event, index, events) => {
                    const isLast = index === events.length - 1;
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
                        <div className="flex flex-row items-center gap-1 text-muted-foreground">
                          <EventTypeBadge type={event.type} />
                          <span className="text-xs text-muted-foreground">
                            • {formatDateTime(event.createdAt)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Done
          </Button>
        </DialogClose>
        {subscription.checkoutLink && (
          <Button asChild>
            <a
              href={subscription.checkoutLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open checkout page
            </a>
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
