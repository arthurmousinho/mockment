import { api } from "@/lib/ky";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";

export type InvoiceStatus = "CREATED" | "PROCESSING" | "ISSUED" | "REJECTED" | "CANCELED";
export type Invoice = {
  id: string;
  status: InvoiceStatus;
  customerName: string;
  customerTaxId: string | null;
  amountInCents: number;
  currency: "BRL" | "USD" | "EUR";
  paymentId: string;
  issuedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function FindAllInvoicesRequest(
  paginationData: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["invoices", paginationData],
    queryFn: async () => {
      const request = await api.get("invoices", { searchParams: paginationData });
      return await request.json<PaginatedAPIResponse<Invoice>>();
    },
    placeholderData: keepPreviousData,
  });
}
