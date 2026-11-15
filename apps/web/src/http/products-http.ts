import type { PaymentCurrency } from "@/http/payments-http";
import { api } from "@/lib/ky";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  externalId: string;
  priceInCents: number;
  currency: PaymentCurrency;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export function FindAllProductsRequest(
  paginationData: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["products", paginationData],
    queryFn: async () => {
      const request = await api.get("products", {
        searchParams: paginationData,
      });
      return await request.json<PaginatedAPIResponse<Product>>();
    },
    placeholderData: keepPreviousData,
  });
}
