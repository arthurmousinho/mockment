import type { PaymentStatus } from "@/http/payments-http";
import type { InvoiceStatus } from "@/http/invoices-http";
import type { SubscriptionStatus } from "@/http/subscription-http";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function canChangePaymentStatus(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus,
) {
  const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    CREATED: ["PROCESSING", "CANCELED"],
    PROCESSING: ["APPROVED", "DECLINED"],
    APPROVED: ["CANCELED", "REFUNDED"],
    DECLINED: [],
    CANCELED: [],
    REFUNDED: [],
  };
  const allowed = validTransitions[currentStatus];
  return allowed.includes(newStatus);
}

export function canChangeInvoiceStatus(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus,
) {
  const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    CREATED: ["PROCESSING", "CANCELED"],
    PROCESSING: ["ISSUED", "CANCELED"],
    ISSUED: ["CANCELED"],
    CANCELED: [],
  };
  const allowed = validTransitions[currentStatus];
  return allowed.includes(newStatus);
}

export function canChangeSubscriptionStatus(
  currentStatus: SubscriptionStatus,
  newStatus: SubscriptionStatus,
) {
  const validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
    ACTIVE: ["PAUSED", "CANCELED"],
    PAUSED: ["ACTIVE", "CANCELED"],
    PENDING: ["CANCELED"], // PEDING -> ACTIVE only through activation
    CANCELED: [],
  };
  const allowed = validTransitions[currentStatus];
  return allowed.includes(newStatus);
}
