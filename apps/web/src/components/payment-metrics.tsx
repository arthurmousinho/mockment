import { GetMetricsRequest, type PaymentCurrency } from "@/http/payments-http";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function PaymentMetrics() {
  const [currency, setCurrency] = useState<PaymentCurrency>("BRL");
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
    { label: "Approval rate", value: numberFormat.format(payments.approvalRate), unit: "%" },
    {
      label: "Total transactions",
      value: numberFormat.format(payments.totalTransactions),
      unit: "payments",
    },
    { label: "Average ticket", value: formatCurrencyFromCents(payments.averageTicket, currency), unit: "" },
    {
      label: "Refunded volume",
      value: formatCurrencyFromCents(payments.refundedVolume, currency),
      unit: "",
    },
  ];

  return (
    <div className="space-y-4">
      <Select value={currency} onValueChange={(value) => setCurrency(value as PaymentCurrency)}>
        <SelectTrigger aria-label="Payment currency"><SelectValue /></SelectTrigger>
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
    </div>
  );
}
