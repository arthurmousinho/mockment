import { api } from "@/lib/ky";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Payment } from "./payments-http";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";

export type PaymentEventType =
  | "PAYMENT_CREATED"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_APPROVED"
  | "PAYMENT_DECLINED"
  | "PAYMENT_CANCELED";

export type PaymentEvent = {
  id: string;
  paymentId: string;
  type: PaymentEventType;
  createdAt: string;
  payload: Payment;
};

export function FindAllPaymentEventsRequest(
  paginationData: PaginatedRequest,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["events", paginationData],
    queryFn: async () => {
      const request = await api.get("events", { searchParams: paginationData });
      return await request.json<PaginatedAPIResponse<PaymentEvent>>();
    },
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}
