import type { PaymentCurrency } from "@/http/payments-http";

export function formatDateTime(date: Date | string | number | null): string {
  if (date === null) return "";

  const d = new Date(date);

  const datePart = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  return `${datePart} ${d.getFullYear()} · ${timePart}`;
}

const CURRENCY_LOCALE_MAP: Record<PaymentCurrency, string> = {
  BRL: "pt-BR",
  USD: "en-US",
  EUR: "de-DE",
};

export function formatCurrencyFromCents(
  amountInCents: number,
  currency: PaymentCurrency,
): string {
  const amount = amountInCents / 100;

  return new Intl.NumberFormat(CURRENCY_LOCALE_MAP[currency], {
    style: "currency",
    currency,
  }).format(amount);
}
