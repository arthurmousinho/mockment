import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import type { PaymentCurrency, PaymentMethod } from "./payments-http";
import { api, apiErrorHandler } from "@/lib/ky";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import type { EventType } from "./events-http";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";

export type CheckoutStatus = "OPEN" | "COMPLETED" | "CANCELED" | "EXPIRED";

export type Checkout = {
  id: string;
  successUrl: string;
  cancelUrl: string;
  apiKeyId: string;
  paymentId: string;
  subscriptionId: string | null;
  createdAt: string;
};

type CheckoutRecord = {
  id: string;
  status: CheckoutStatus;
  amountInCents: number;
  currency: PaymentCurrency;
  allowedMethods: PaymentMethod[];
  customerId: string | null;
  paymentId: string | null;
  subscriptionId: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutListItem = CheckoutRecord & {
  link: string;
};

type CheckoutOptions = {
  successUrl?: string;
  cancelUrl?: string;
  expiresAt?: string;
};

export type CreateCheckoutRequestData = {
  apiKey: string;
} & CheckoutOptions &
  (
    | {
        amountInCents: number;
        currency: PaymentCurrency;
        allowedMethods: PaymentMethod[];
        customerId?: string;
        subscriptionId?: never;
      }
    | {
        subscriptionId: string;
        amountInCents?: never;
        currency?: never;
        allowedMethods?: never;
        customerId?: never;
      }
  );

export function CreateCheckoutRequest() {
  return useMutation({
    mutationFn: async ({ apiKey, ...body }: CreateCheckoutRequestData) => {
      const response = await api.post("checkouts", {
        headers: { Authorization: `Bearer ${apiKey}` },
        json: body,
      });
      return response.json<CheckoutListItem>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkouts"] });
      toast.success("Checkout created successfully.");
    },
    onError: apiErrorHandler,
  });
}

type DetailedCheckout = CheckoutRecord & {
  events: { id: string; type: EventType; createdAt: string }[];
};

export function GetCheckoutDetailsRequest(id: string) {
  return useQuery({
    queryKey: ["checkouts", id],
    queryFn: async () => {
      const request = await api.get(`checkouts/${id}`);
      return await request.json<DetailedCheckout>();
    },
  });
}

export type CheckoutCompletionStatus = "APPROVED" | "DECLINED" | "CANCELED";

export function FindAllCheckoutsRequest(
  paginationData: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["checkouts", paginationData],
    queryFn: async () => {
      const request = await api.get("checkouts", {
        searchParams: paginationData,
      });
      return await request.json<PaginatedAPIResponse<CheckoutListItem>>();
    },
    placeholderData: keepPreviousData,
  });
}

export function CompleteCheckoutRequest(id: string) {
  return useMutation({
    mutationFn: async (status: CheckoutCompletionStatus) => {
      const request = await api.post(`checkouts/${id}/complete`, {
        json: { status },
      });
      return await request.json<Checkout>();
    },
  });
}
