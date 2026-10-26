import { api, apiErrorHandler } from "@/lib/ky";
import { queryClient } from "@/lib/query-client";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";
import type { EventType } from "./events-http";

export type PaymentCurrency = "BRL" | "USD" | "EUR";
export type PaymentMethod = "CARD" | "PIX" | "BANK_SLIP";
export type PaymentStatus =
  "CREATED" | "PROCESSING" | "APPROVED" | "DECLINED" | "CANCELED";

export type Payment = {
  id: string;
  amountInCents: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string | null;
  externalId: string | null;
  idempotencyKey: string | null;
  apiKeyId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentRequestData = {
  apiKey: string;
  amountInCents: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  successUrl?: string;
  cancelUrl?: string;
  description?: string;
  externalId?: string;
  idempotencyKey?: string;
};

export type CreatePaymentResponse = Omit<Payment, "apiKeyId"> & {
  checkoutLink: string;
};

export function CreatePaymentRequest() {
  return useMutation({
    mutationFn: async ({ apiKey, ...body }: CreatePaymentRequestData) => {
      const request = await api.post("payments", {
        headers: { Authorization: `Bearer ${apiKey}` },
        json: body,
      });
      return await request.json<CreatePaymentResponse>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment created successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function FindAllPaymentsRequest(
  paginationData: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["payments", paginationData],
    queryFn: async () => {
      const request = await api.get("payments", {
        searchParams: paginationData,
      });
      return await request.json<PaginatedAPIResponse<Payment>>();
    },
    placeholderData: keepPreviousData,
  });
}

export type DetailedPayment = Payment & {
  events: {
    id: string;
    type: EventType;
    createdAt: string;
  }[];
};

export function GetPaymentDetailsRequest(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: async () => {
      const request = await api.get(`payments/${id}`);
      return await request.json<DetailedPayment>();
    },
    enabled: options?.enabled ?? true,
  });
}

export function ApprovePaymentRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`payments/${id}/approve`);
      return await request.json<Payment>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment approved successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function DeclinePaymentRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`payments/${id}/decline`);
      return await request.json<Payment>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment declined successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function CancelPaymentRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`payments/${id}/cancel`);
      return await request.json<Payment>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment canceled successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function ProcessPaymentRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`payments/${id}/process`);
      return await request.json<Payment>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment marked as processing.");
    },
    onError: apiErrorHandler,
  });
}
