import type { PaymentCurrency } from "@/http/payments-http";
import { api, apiErrorHandler } from "@/lib/ky";
import { queryClient } from "@/lib/query-client";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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

export function ToggleProductRequest() {
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await api.patch(`products/${id}/toggle`, { json: { enabled } });
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(enabled ? "Product enabled." : "Product disabled.");
    },
    onError: apiErrorHandler,
  });
}

export function GetProductDetailsRequest(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const response = await api.get(`products/${id}`);
      return response.json<Product>();
    },
  });
}

export type CreateProductRequestData = Pick<
  Product,
  "name" | "externalId" | "priceInCents" | "currency"
> & { description?: string };

export function CreateProductRequest() {
  return useMutation({
    mutationFn: async (data: CreateProductRequestData) => {
      const response = await api.post("products", { json: data });
      return response.json<Product>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully.");
    },
    onError: apiErrorHandler,
  });
}
