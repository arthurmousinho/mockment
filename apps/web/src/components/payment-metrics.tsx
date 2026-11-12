import {
  GetMetricsRequest,
  type PaymentCurrency,
  type PaymentMethod,
  type PaymentStatus,
} from "@/http/payments-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { RefetchButton } from "@/components/refetch-button";
import { PaymentCurrencyBadge } from "@/components/payment-currency-badge";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { PaymentMetricsSkeleton } from "@/components/payment-metrics-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { PaymentStatusBadge } from "@/components/payment-status-badge";

const chartConfig = {
  CREATED: { label: "Created", color: "var(--color-slate-500)" },
  PROCESSING: { label: "Processing", color: "var(--color-blue-500)" },
  APPROVED: { label: "Approved", color: "var(--color-green-600)" },
  DECLINED: { label: "Declined", color: "var(--color-red-600)" },
  CANCELED: { label: "Canceled", color: "var(--color-zinc-500)" },
  REFUNDED: { label: "Refunded", color: "var(--color-purple-500)" },
} satisfies ChartConfig;

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function PaymentMetrics() {
  const [currency, setCurrency] = useState<PaymentCurrency>("BRL");
  const [measure, setMeasure] = useState<"count" | "volume">("count");
  const { data, isPending, isError, isFetching, refetch } =
    GetMetricsRequest(currency);
  const payments = data;
  const cards = payments && [
    {
      label: "Total payment volume",
      value: formatCurrencyFromCents(payments.totalPaymentVolume, currency),
      unit: "",
    },
    {
      label: "Approved volume",
      value: formatCurrencyFromCents(payments.approvedVolume, currency),
      unit: "",
    },
    {
      label: "Approval rate",
      value: numberFormat.format(payments.approvalRate),
      unit: "%",
    },
    {
      label: "Total transactions",
      value: numberFormat.format(payments.totalTransactions),
      unit: "payments",
    },
    {
      label: "Average ticket",
      value: formatCurrencyFromCents(payments.averageTicket, currency),
      unit: "",
    },
    {
      label: "Refunded volume",
      value: formatCurrencyFromCents(payments.refundedVolume, currency),
      unit: "",
    },
  ];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {payments && (
          <span role="status" className="text-sm text-muted-foreground">
            Last updated: {formatDateTime(payments.requestedAt)}
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as PaymentCurrency)}
          >
            <SelectTrigger aria-label="Payment currency">
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
      {isPending && <PaymentMetricsSkeleton />}
      {isError && (
        <p role="alert" className="text-destructive">
          Unable to load metrics. Please try again.
        </p>
      )}
      {cards && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded border bg-card p-5">
              <h3 className="text-sm font-medium text-muted-foreground">
                {card.label}
              </h3>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {card.value}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {card.unit}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
      {payments && (
        <section className="min-w-0 space-y-4 rounded-none border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium tracking-tight">
                Payment activity
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Last 8 hours · Hourly · {currency}
              </p>
            </div>
            <Select
              value={measure}
              onValueChange={(value) => setMeasure(value as "count" | "volume")}
            >
              <SelectTrigger aria-label="Chart measure">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Transactions</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ChartContainer config={chartConfig} className="h-64 w-full sm:h-80">
            <AreaChart
              accessibilityLayer
              margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
              data={payments.hourlyReport.map((entry) => ({
                hour: entry.hour,
                ...Object.fromEntries(
                  Object.entries(entry.statuses).map(([status, values]) => [
                    status,
                    values[measure],
                  ]),
                ),
              }))}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 5"
                strokeOpacity={0.5}
              />
              <XAxis
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                dataKey="hour"
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={56}
                tickCount={5}
                allowDecimals={false}
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat(undefined, {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(measure === "volume" ? value / 100 : value)
                }
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    className="min-w-52 rounded-none border-border bg-popover p-3 text-popover-foreground shadow-md"
                    labelFormatter={(value) =>
                      new Date(String(value)).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    formatter={(value, name) => (
                      <div className="flex w-full items-center gap-2.5">
                        <PaymentStatusBadge status={name as PaymentStatus} />
                        <span className="ml-auto font-medium tabular-nums">
                          {measure === "volume"
                            ? formatCurrencyFromCents(Number(value), currency)
                            : numberFormat.format(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              {(Object.keys(chartConfig) as PaymentStatus[]).map((status) => (
                <Area
                  key={status}
                  type="monotone"
                  dataKey={status}
                  stroke={`var(--color-${status})`}
                  fill={`var(--color-${status})`}
                  fillOpacity={0.12}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
          <p className="text-xs text-muted-foreground">
            Grouped by creation time and current payment status. The current
            hour is still in progress.
          </p>
        </section>
      )}
      {payments && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="min-w-0 space-y-4 border bg-card p-5">
            <div>
              <h2 className="text-sm font-medium">Payments by method</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                All-time transactions in {currency}.
              </p>
            </div>
            <ChartContainer
              config={{
                count: { label: "Transactions", color: "var(--primary)" },
              }}
              className="h-64 w-full"
            >
              <BarChart
                accessibilityLayer
                data={(["CARD", "PIX", "BANK_SLIP"] as PaymentMethod[]).map(
                  (method) => ({
                    method,
                    count: payments.countByMethod[method],
                  }),
                )}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 5" />
                <XAxis
                  dataKey="method"
                  axisLine={false}
                  tickLine={false}
                  height={40}
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <foreignObject
                      x={Number(x) - 50}
                      y={Number(y) + 4}
                      width={100}
                      height={32}
                    >
                      <div className="flex justify-center">
                        <PaymentMethodBadge
                          method={payload.value as PaymentMethod}
                        />
                      </div>
                    </foreignObject>
                  )}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  maxBarSize={56}
                />
              </BarChart>
            </ChartContainer>
          </section>
          <section className="min-w-0 space-y-4 border bg-card p-5">
            <div>
              <h2 className="text-sm font-medium">Payments by status</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Current statuses of all transactions in {currency}.
              </p>
            </div>
            <ChartContainer
              config={{
                count: { label: "Transactions", color: "var(--primary)" },
              }}
              className="h-64 w-full"
            >
              <RadarChart
                accessibilityLayer
                data={(Object.keys(chartConfig) as PaymentStatus[]).map(
                  (status) => ({
                    status,
                    count: payments.countByStatus[status],
                  }),
                )}
              >
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="status"
                  tickFormatter={(status: PaymentStatus) =>
                    chartConfig[status].label
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _name, item) => {
                        const status = item.payload.status as PaymentStatus;
                        const count = Number(value);
                        const percentage = payments.totalTransactions
                          ? (count / payments.totalTransactions) * 100
                          : 0;
                        return (
                          <div className="flex items-center gap-3">
                            <PaymentStatusBadge status={status} />
                            <span className="text-muted-foreground">
                              {numberFormat.format(count)} ·{" "}
                              {numberFormat.format(percentage)}%
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Radar
                  dataKey="count"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ChartContainer>
          </section>
        </div>
      )}
    </div>
  );
}
