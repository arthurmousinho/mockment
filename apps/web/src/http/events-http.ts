import { api } from "@/lib/ky";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";

export type EventType =
  | "PAYMENT_CREATED"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_APPROVED"
  | "PAYMENT_DECLINED"
  | "PAYMENT_CANCELED"
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_RENEWED"
  | "SUBSCRIPTION_PAUSED"
  | "SUBSCRIPTION_RESUMED"
  | "SUBSCRIPTION_CANCELED";

export type Event = {
  id: string;
  type: EventType;
  subscriptionId: string | null;
  paymentId: string | null;
  payload: unknown;
  createdAt: string;
};

export function FindAllEventsRequest(
  paginationData: PaginatedRequest,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["events", paginationData],
    queryFn: async () => {
      const request = await api.get("events", { searchParams: paginationData });
      return await request.json<PaginatedAPIResponse<Event>>();
    },
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}
