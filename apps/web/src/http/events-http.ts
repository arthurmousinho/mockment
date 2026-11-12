import { api, apiErrorHandler } from "@/lib/ky";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";

export type EventType =
  | "PAYMENT_CREATED"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_APPROVED"
  | "PAYMENT_DECLINED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_CANCELED"
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_RENEWED"
  | "SUBSCRIPTION_PAUSED"
  | "SUBSCRIPTION_RESUMED"
  | "SUBSCRIPTION_CANCELED"
  | "INVOICE_CREATED"
  | "INVOICE_PROCESSING"
  | "INVOICE_ISSUED"
  | "INVOICE_REJECTED"
  | "INVOICE_CANCELED";

export type Event = {
  id: string;
  type: EventType;
  subscriptionId: string | null;
  paymentId: string | null;
  payload: unknown;
  createdAt: string;
};

export function FindAllEventsRequest(
  paginationData: PaginatedRequest & { search?: string },
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

export function GetEventDetailsRequest(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: async () => {
      const response = await api.get(`events/${id}`);
      return response.json<Event>();
    },
    enabled: Boolean(id),
  });
}

export function ReplayEventRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`events/${id}/replay`);
      return await response.json<Event>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", "deliveries"] });
      toast.success("Event replay completed. Check webhook deliveries for results.");
    },
    onError: apiErrorHandler,
  });
}
