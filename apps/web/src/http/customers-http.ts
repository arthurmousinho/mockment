import { api, apiErrorHandler } from "@/lib/ky";
import { queryClient } from "@/lib/query-client";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
  options?: { enabled?: boolean },
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
    enabled: options?.enabled ?? true,
  });
}

export type CreateCustomerRequestData = Pick<
  Customer,
  "name" | "email" | "phone" | "document" | "externalId"
>;

export function CreateCustomerRequest() {
  return useMutation({
    mutationFn: async (data: CreateCustomerRequestData) => {
      const request = await api.post("customers", { json: data });
      return await request.json<Customer>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function GetCustomerDetailsRequest(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const response = await api.get(`customers/${id}`);
      return response.json<Customer>();
    },
    enabled: options?.enabled ?? true,
  });
}

export function UpdateCustomerRequest() {
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & CreateCustomerRequestData) => {
      const response = await api.patch(`customers/${id}`, { json: data });
      return response.json<Customer>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function DeleteCustomerRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully.");
    },
    onError: apiErrorHandler,
  });
}
