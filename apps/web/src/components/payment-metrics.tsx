import { GetMetricsRequest } from "@/http/payments-http";

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function PaymentMetrics() {
  const { data, isPending, isError } = GetMetricsRequest();
  const payments = data;
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
    <div className="space-y-4">
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
    </div>
  );
}
