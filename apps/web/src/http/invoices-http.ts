import { api, apiErrorHandler } from "@/lib/ky";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";
import type { EventType } from "./events-http";

export type InvoiceStatus =
  "CREATED" | "PROCESSING" | "ISSUED" | "REJECTED" | "CANCELED";
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

export type DetailedInvoice = Invoice & {
  events: { id: string; type: EventType; createdAt: string }[];
};

export type CreateInvoiceRequestData = {
  apiKey: string;
  paymentId: string;
  customerName: string;
  customerTaxId?: string;
};

export function CreateInvoiceRequest() {
  return useMutation({
    mutationFn: async ({ apiKey, ...body }: CreateInvoiceRequestData) => {
      const response = await api.post("invoices", {
        headers: { Authorization: `Bearer ${apiKey}` },
        json: body,
      });
      return response.json<Invoice>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function UpdateInvoiceRequest() {
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      customerName: string;
      customerTaxId: string | null;
    }) => {
      const response = await api.patch(`invoices/${id}`, { json: body });
      return response.json<Invoice>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice updated successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function ProcessInvoiceRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`invoices/${id}/process`);
      return response.json<Invoice>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Invoice marked as processing.");
    },
    onError: apiErrorHandler,
  });
}

export function IssueInvoiceRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`invoices/${id}/issue`);
      return response.json<Invoice>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice issued successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function CancelInvoiceRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`invoices/${id}/cancel`);
      return response.json<Invoice>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice canceled successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function DownloadInvoicePdfRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`invoices/${encodeURIComponent(id)}/pdf`);
      return response.blob();
    },
    onSuccess: (pdf, id) => {
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    onError: apiErrorHandler,
  });
}

export function FindAllInvoicesRequest(
  paginationData: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["invoices", paginationData],
    queryFn: async () => {
      const request = await api.get("invoices", {
        searchParams: paginationData,
      });
      return await request.json<PaginatedAPIResponse<Invoice>>();
    },
    placeholderData: keepPreviousData,
  });
}

export function GetInvoiceDetailsRequest(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const response = await api.get(`invoices/${id}`);
      return response.json<DetailedInvoice>();
    },
    enabled: options?.enabled ?? true,
  });
}
