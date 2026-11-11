import {
  GetMetricsRequest,
  type PaymentCurrency,
  type PaymentStatus,
} from "@/http/payments-http";
import { formatCurrencyFromCents } from "@/lib/formatters";
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
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
  const { data, isPending, isError } = GetMetricsRequest(currency);
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
      <Select
        value={currency}
        onValueChange={(value) => setCurrency(value as PaymentCurrency)}
      >
        <SelectTrigger aria-label="Payment currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="BRL">BRL</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
        </SelectContent>
      </Select>
      {isPending && (
        <p role="status" className="text-muted-foreground">
          Loading metrics...
        </p>
      )}
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
            <LineChart
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
                <Line
                  key={status}
                  type="monotone"
                  dataKey={status}
                  stroke={`var(--color-${status})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
          <p className="text-xs text-muted-foreground">
            Grouped by creation time and current payment status. The current
            hour is still in progress.
          </p>
        </section>
      )}
    </div>
  );
}
