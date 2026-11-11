import { GetMetricsRequest } from "@/http/metrics-http";
import { SpeedometerIcon } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function MockboardPage() {
  const { data, isPending, isError } = GetMetricsRequest();
  const payments = data?.payments;
  const cards = payments && [
    {
      label: "Total payment volume",
      value: payments.totalPaymentVolume / 100,
      unit: "",
    },
    {
      label: "Approved volume",
      value: payments.approvedVolume / 100,
      unit: "",
    },
    { label: "Approval rate", value: payments.approvalRate, unit: "%" },
    {
      label: "Total transactions",
      value: payments.totalTransactions,
      unit: "payments",
    },
    { label: "Average ticket", value: payments.averageTicket / 100, unit: "" },
    {
      label: "Refunded volume",
      value: payments.refundedVolume / 100,
      unit: "",
    },
  ];

  return (
    <Tabs defaultValue="payments" className="min-w-0 space-y-4">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <SpeedometerIcon size={24} className="font-medium" />
            <h1 className="text-xl font-medium tracking-tight">Mockboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitor key metrics across your payments, subscriptions, invoices,
            and webhooks in one place.
          </p>
        </div>
        <TabsList
          variant="line"
          className="h-auto max-w-full shrink-0 flex-wrap justify-start gap-y-2"
        >
          <TabsTrigger
            className="data-active:text-primary after:bg-primary"
            value="payments"
          >
            Payments
          </TabsTrigger>
          <TabsTrigger
            className="data-active:text-primary after:bg-primary"
            value="subscriptions"
          >
            Subscriptions
          </TabsTrigger>
          <TabsTrigger
            className="data-active:text-primary after:bg-primary"
            value="invoices"
          >
            Invoices
          </TabsTrigger>
          <TabsTrigger
            className="data-active:text-primary after:bg-primary"
            value="webhooks"
          >
            Webhooks
          </TabsTrigger>
        </TabsList>
      </header>
      <TabsContent value="payments" className="space-y-4 text-sm">
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
                  {numberFormat.format(card.value)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {card.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
      {(["subscriptions", "invoices", "webhooks"] as const).map((entity) => (
        <TabsContent
          key={entity}
          value={entity}
          className="py-6 text-sm text-muted-foreground"
        >
          Metrics for {entity} are not available yet.
        </TabsContent>
      ))}
    </Tabs>
  );
}
