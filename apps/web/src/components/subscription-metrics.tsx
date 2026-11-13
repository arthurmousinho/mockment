import { PaymentCurrencyBadge } from "@/components/payment-currency-badge";
import { RefetchButton } from "@/components/refetch-button";
import { SubscriptionMetricsSkeleton } from "@/components/subscription-metrics-skeleton";
import { SubscriptionStatusBadge } from "@/components/subscription-status-badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentCurrency } from "@/http/payments-http";
import {
  GetSubscriptionMetricsRequest,
  type SubscriptionStatus,
} from "@/http/subscription-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { useState } from "react";

const statuses: { status: SubscriptionStatus; color: string }[] = [
  { status: "ACTIVE", color: "text-green-400 dark:text-green-400" },
  { status: "PENDING", color: "text-gray-400 dark:text-gray-400" },
  { status: "PAUSED", color: "text-yellow-400 dark:text-yellow-400" },
  { status: "CANCELED", color: "text-red-400 dark:text-red-400" },
];

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function SubscriptionMetrics() {
  const [currency, setCurrency] = useState<PaymentCurrency>("BRL");
  const { data, dataUpdatedAt, isPending, isError, isFetching, refetch } =
    GetSubscriptionMetricsRequest(currency);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {data && (
          <span role="status" className="text-sm text-muted-foreground">
            Last updated: {formatDateTime(dataUpdatedAt)}
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as PaymentCurrency)}
          >
            <SelectTrigger aria-label="Subscription currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">
                <PaymentCurrencyBadge currency="BRL" />
              </SelectItem>
              <SelectItem value="USD">
                <PaymentCurrencyBadge currency="USD" />
              </SelectItem>
              <SelectItem value="EUR">
                <PaymentCurrencyBadge currency="EUR" />
              </SelectItem>
            </SelectContent>
          </Select>
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        </div>
      </header>
      {isPending && <SubscriptionMetricsSkeleton />}
      {isError && (
        <p role="alert" className="text-destructive">
          Unable to load metrics. Please try again.
        </p>
      )}
      {data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-4 md:grid-cols-2 xl:col-span-3">
            <div className="rounded border bg-card p-5">
              <h3 className="text-sm font-medium text-muted-foreground">
                Monthly recurring revenue (MRR)
              </h3>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {formatCurrencyFromCents(data.mrr, currency)}
              </p>
            </div>
            <div className="rounded border bg-card p-5">
              <h3 className="text-sm font-medium text-muted-foreground">
                Annual recurring revenue (ARR)
              </h3>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {formatCurrencyFromCents(data.arr, currency)}
              </p>
            </div>
          </div>
          <div className="rounded border bg-card p-5 xl:col-start-4 xl:row-start-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total subscriptions
            </h3>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {numberFormat.format(data.totalSubscriptions)}
            </p>
          </div>
          <div className="rounded border bg-card p-5 xl:col-start-4 xl:row-start-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Active subscriptions
            </h3>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {numberFormat.format(data.countByStatus.ACTIVE)}
            </p>
          </div>
          <section className="space-y-4 rounded border bg-card p-5 xl:col-span-3 xl:row-span-2 xl:row-start-2">
            <div>
              <h2 className="text-sm font-medium">Subscriptions by status</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Current statuses of all subscriptions in {currency}.
              </p>
            </div>
            {data.totalSubscriptions === 0 && (
              <p className="text-sm text-muted-foreground">
                No subscriptions in this currency yet.
              </p>
            )}
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              {statuses.map(({ status, color }) => {
                const count = data.countByStatus[status];
                const percentage = data.totalSubscriptions
                  ? (count / data.totalSubscriptions) * 100
                  : 0;
                return (
                  <div key={status} className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <SubscriptionStatusBadge status={status} />
                      <span className="text-muted-foreground">
                        {numberFormat.format(count)} ·{" "}
                        {numberFormat.format(percentage)}%
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      aria-label={`${status} subscriptions`}
                      aria-valuetext={`${count} subscriptions, ${numberFormat.format(percentage)}%`}
                      className={`h-4 ${color} [&_[data-slot=progress-indicator]]:bg-current`}
                    />
                  </div>
                );
              })}
            </div>
          </section>
          <div className="flex flex-col rounded border bg-card p-5 xl:col-start-4 xl:row-start-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Churn rate
            </h3>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {numberFormat.format(data.churnRate)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
