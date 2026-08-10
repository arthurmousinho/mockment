import { useMutation, useQuery } from "@tanstack/react-query";
import type { Payment } from "./payments-http";
import { api } from "@/lib/ky";
import type { Subscription } from "./subscription-http";

type Checkout = {
  id: string;
  successUrl: string;
  cancelUrl: string;
  apiKeyId: string;
  paymentId: string;
  subscriptionId: string | null;
  createdAt: string;
};

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

export function CompleteCheckoutRequest(id: string) {
  return useMutation({
    mutationFn: async (status: CheckoutCompletionStatus) => {
      await api.post(`checkouts/${id}/complete`, {
        json: { status },
      });
    },
  });
}
