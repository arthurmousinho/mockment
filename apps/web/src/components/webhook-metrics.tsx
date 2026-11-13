import { RefetchButton } from "@/components/refetch-button";
import { WebhookMetricsSkeleton } from "@/components/webhook-metrics-skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  GetWebhookDeliveryMetricsRequest,
  type WebhookDeliveryStatus,
} from "@/http/webhooks-http";
import { formatDateTime } from "@/lib/formatters";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  SUCCESS: { label: "Success", color: "var(--color-green-600)" },
  FAILED: { label: "Failed", color: "var(--color-red-600)" },
  PENDING: { label: "Pending", color: "var(--color-slate-500)" },
} satisfies ChartConfig;

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function WebhookMetrics() {
  const { data, isPending, isError, isFetching, refetch } =
    GetWebhookDeliveryMetricsRequest();
  const cards = data && [
    {
      label: "Total deliveries",
      value: numberFormat.format(data.totalDeliveries),
    },
    {
      label: "Delivered today (UTC)",
      value: numberFormat.format(data.deliveredToday),
    },
    {
      label: "Success rate",
      value: `${numberFormat.format(data.successRate)}%`,
    },
    {
      label: "Successful deliveries",
      value: numberFormat.format(data.countByStatus.SUCCESS),
    },
    {
      label: "Failed deliveries",
      value: numberFormat.format(data.countByStatus.FAILED),
    },
    {
      label: "Pending deliveries",
      value: numberFormat.format(data.countByStatus.PENDING),
    },
  ];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {data && (
          <span role="status" className="text-sm text-muted-foreground">
            Last updated: {formatDateTime(data.requestedAt)}
          </span>
        )}
        <div className="ml-auto">
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        </div>
      </header>
      {isPending && <WebhookMetricsSkeleton />}
      {isError && (
        <p role="alert" className="text-destructive">
          Unable to load metrics. Please try again.
        </p>
      )}
      {data && cards && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div key={card.label} className="rounded border bg-card p-5">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </h3>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
          <section className="min-w-0 space-y-4 border bg-card p-5">
            <div>
              <h2 className="text-sm font-medium tracking-tight">
                Delivery activity
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Last 10 minutes · By creation time and current status
              </p>
            </div>
            {data.totalDeliveries === 0 && (
              <p className="text-sm text-muted-foreground">
                No webhook deliveries yet.
              </p>
            )}
            <ChartContainer
              config={chartConfig}
              className="h-64 w-full sm:h-80"
            >
              <AreaChart
                accessibilityLayer
                data={data.minuteReport}
                margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 5"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="minute"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  minTickGap={30}
                  tickFormatter={(value: string) =>
                    new Date(value).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  width={40}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(String(value)).toLocaleString()
                      }
                    />
                  }
                />
                {(Object.keys(chartConfig) as WebhookDeliveryStatus[]).map(
                  (status) => (
                    <Area
                      key={status}
                      type="monotone"
                      dataKey={status}
                      stroke={`var(--color-${status})`}
                      fill={`var(--color-${status})`}
                      fillOpacity={0.12}
                      strokeWidth={2}
                      dot={false}
                    />
                  ),
                )}
              </AreaChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Success rate includes pending deliveries. The current minute is
              still in progress.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
