import { api } from "@/lib/ky";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  externalId: string;
  createdAt: string;
  updatedAt: string;
};

export function FindAllCustomersRequest(
  paginationData: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["customers", paginationData],
    queryFn: async () => {
      const request = await api.get("customers", {
        searchParams: paginationData,
      });
      return await request.json<PaginatedAPIResponse<Customer>>();
    },
    placeholderData: keepPreviousData,
  });
}
