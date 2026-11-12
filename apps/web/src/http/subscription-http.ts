import type { Event } from "./events-http";
import { api, apiErrorHandler } from "@/lib/ky";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import type { PaymentCurrency, PaymentMethod } from "./payments-http";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";

export type SubscriptionInterval = "DAY" | "WEEK" | "MONTH" | "YEAR";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAUSED" | "PENDING";

export type SubscriptionMetrics = {
  totalSubscriptions: number;
  countByStatus: Record<SubscriptionStatus, number>;
  churnRate: number;
  mrr: number;
};

export function GetSubscriptionMetricsRequest(currency: PaymentCurrency) {
  return useQuery({
    queryKey: ["subscriptions", "metrics", currency],
    queryFn: async () => {
      const request = await api.get(`subscriptions/metrics/${currency}`);
      return await request.json<SubscriptionMetrics>();
    },
  });
}

export type Subscription = {
  id: string;
  customerId: string;
  description: string | null;
  amountInCents: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  interval: SubscriptionInterval;
  intervalCount: number;
  status: SubscriptionStatus;
  nextBillingAt: string | null;
  createdAt: string;
  updatedAt: string;
  apiKeyId: string;
};

export type DetailedSubscription = Subscription & {
  events: Pick<Event, "id" | "type" | "createdAt">[];
};

export type CreateSubscriptionResponse = Subscription & {
  checkoutId: string;
  checkoutLink: string;
  initPaymentId: string;
};

export type CreateSubscriptionRequestData = {
  customerId: string;
  apiKey: string;
  amountInCents: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  interval: SubscriptionInterval;
  description?: string;
  intervalCount?: number;
};

export function CreateSubscriptionRequest() {
  return useMutation({
    mutationFn: async (data: CreateSubscriptionRequestData) => {
      const headers = { Authorization: `Bearer ${data.apiKey}` };
      const body = {
        customerId: data.customerId,
        amountInCents: data.amountInCents,
        currency: data.currency,
        method: data.method,
        interval: data.interval,
        intervalCount: data.intervalCount,
        description: data.description,
      };
      const request = await api.post(`subscriptions`, { headers, json: body });
      return await request.json<CreateSubscriptionResponse>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription created successfully.");
    },
    onError: apiErrorHandler,
  });
}

type UpdateSubscriptionRequestData = Partial<
  Omit<CreateSubscriptionRequestData, "customerId" | "apiKey">
> & {
  id: string;
};

export function UpdateSubscriptionRequest() {
  return useMutation({
    mutationFn: async (data: UpdateSubscriptionRequestData) => {
      const request = await api.patch(`subscriptions/${data.id}`, {
        json: {
          ...data,
          id: undefined,
          apiKey: undefined,
        },
      });
      return await request.json<Subscription>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription updated successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function FindAllSubscriptionsRequest(
  paginationData: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["subscriptions", paginationData],
    queryFn: async () => {
      const request = await api.get("subscriptions", {
        searchParams: paginationData,
      });
      return await request.json<PaginatedAPIResponse<Subscription>>();
    },
    placeholderData: keepPreviousData,
  });
}

export function ResumeSubscriptionRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`subscriptions/${id}/resume`);
      return await request.json<Subscription>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription resumed successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function CancelSubscriptionRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`subscriptions/${id}/cancel`);
      return await request.json<Subscription>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription canceled successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function PauseSubscriptionRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`subscriptions/${id}/pause`);
      return await request.json<Subscription>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription paused successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function GetSubscriptionDetailsRequest(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: async () => {
      const request = await api.get(`subscriptions/${id}`);
      return await request.json<DetailedSubscription>();
    },
    enabled: options?.enabled ?? true,
  });
}
