import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import type { Payment } from "./payments-http";
import { api } from "@/lib/ky";
import type { Subscription } from "./subscription-http";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";

export type Checkout = {
  id: string;
  successUrl: string;
  cancelUrl: string;
  apiKeyId: string;
  paymentId: string;
  subscriptionId: string | null;
  createdAt: string;
};

export type CheckoutListItem = Checkout & { link: string };

type DetailedCheckout = Checkout & {
  payment: Payment;
  subscription: Subscription | null;
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
      await api.post(`checkouts/${id}/complete`, {
        json: { status },
      });
    },
  });
}
