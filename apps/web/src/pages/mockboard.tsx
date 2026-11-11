import { PaymentMetrics } from "@/components/payment-metrics";
import { SpeedometerIcon } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MockboardPage() {
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
        <PaymentMetrics />
      </TabsContent>
      {(["subscriptions", "invoices", "webhooks"] as const).map((entity) => (
        <TabsContent
          key={entity}
          value={entity}
          className="py-6 text-sm text-muted-foreground"
        >
          <div>Metrics for {entity} are not available yet.</div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
