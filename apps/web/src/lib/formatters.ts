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

export function formatDuration(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const milliseconds = new Date(end).getTime() - new Date(start).getTime();

  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "—";
  if (milliseconds < 1000) return `${milliseconds} ms`;

  const seconds = milliseconds / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;

  const minutes = Math.floor(seconds / 60);
  return `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} h ` : ""}${minutes % 60} m ${Math.floor(seconds % 60)} s`;
}
