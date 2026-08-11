import { api, apiErrorHandler } from "@/lib/ky";
import { queryClient } from "@/lib/query-client";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export type ApiKey = {
  id: string;
  name: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function FindAllApiKeysRequest(paginationData: PaginatedRequest) {
  return useQuery({
    queryKey: ["api-keys", paginationData],
    queryFn: async () => {
      const request = await api.get("api-keys", {
        searchParams: paginationData,
      });
      return await request.json<PaginatedAPIResponse<ApiKey>>();
    },
    placeholderData: keepPreviousData,
  });
}

type CreateApiKeyRequestData = {
  name: string;
};

type CreateApiKeyResponse = {
  id: string;
  name: string;
  rawKey: string;
};

export function CreateApiKeyRequest() {
  return useMutation({
    mutationFn: async (data: CreateApiKeyRequestData) => {
      const request = api.post("api-keys", { json: data });
      return await request.json<CreateApiKeyResponse>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function DeleteApiKeyRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key deleted successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function RevokeApiKeyRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`api-keys/${id}/revoke`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked successfully.");
    },
    onError: apiErrorHandler,
  });
}

type RotateApiKeyResponse = {
  rawKey: string;
};

export function RotateApiKeyRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`api-keys/${id}/rotate`);
      return await request.json<RotateApiKeyResponse>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key rotated successfully.");
    },
    onError: apiErrorHandler,
  });
}
