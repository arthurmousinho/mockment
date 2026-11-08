import { api, apiErrorHandler } from "@/lib/ky";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";
import type { EventType } from "./events-http";

export type WebhookEndpoint = {
  enabled: boolean;
  id: string;
  url: string;
  events: EventType[];
  apiKeyId: string;
  createdAt: string;
  updatedAt: string;
};

export function FindAllWebhookEndpointsRequest(
  paginationData: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["webhooks", "endpoints", paginationData],
    queryFn: async () => {
      const request = await api.get("webhooks/endpoints", {
        searchParams: paginationData,
      });
      return await request.json<PaginatedAPIResponse<WebhookEndpoint>>();
    },
    placeholderData: keepPreviousData,
  });
}

export type CreateWebhookEndpointRequestData = {
  url: string;
  events: EventType[];
  apiKey: string;
};

export type CreateWebhookEndpointResponseData = {
  id: string;
  url: string;
  secret: string;
  events: EventType[];
  apiKeyId: string;
  createdAt: string;
  updatedAt: string;
};

export function CreateWebhookEndpointRequest() {
  return useMutation({
    mutationFn: async (data: CreateWebhookEndpointRequestData) => {
      const headers = { Authorization: `Bearer ${data.apiKey}` };
      const body = { url: data.url, events: data.events };
      const request = await api.post("webhooks/endpoints", {
        json: body,
        headers,
      });
      return await request.json<CreateWebhookEndpointResponseData>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", "endpoints"] });
      toast.success("Webhook endpoint created successfully.");
    },
    onError: apiErrorHandler,
  });
}

export type RotateWebhookEndpointResponseData = {
  secret: string;
};

export function RotateWebhookEndpointRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const request = await api.patch(`webhooks/endpoints/${id}/secret/rotate`);
      return await request.json<RotateWebhookEndpointResponseData>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", "endpoints"] });
      toast.success("Webhook endpoint secret rotated successfully.");
    },
    onError: apiErrorHandler,
  });
}

export function DeleteWebhookEndpointRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`webhooks/endpoints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", "endpoints"] });
      toast.success("Webhook endpoint deleted successfully.");
    },
    onError: apiErrorHandler,
  });
}

export type eUpdateWebhookEndpointRequestData = {
  id: string;
  url: string;
  events: string[];
};

export function UpdateWebhookEndpointRequest() {
  return useMutation({
    mutationFn: async (data: eUpdateWebhookEndpointRequestData) => {
      const body = { url: data.url, events: data.events };
      await api.patch(`webhooks/endpoints/${data.id}`, { json: body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", "endpoints"] });
      toast.success("Webhook endpoint updated successfully.");
    },
    onError: apiErrorHandler,
  });
}

export type WebhookDelivery = {
  id: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  statusCode: number | null;
  error: string | null;
  endpointId: string;
  eventId: string;
  deliveredAt: string | null;
  createdAt: string;
};

export type WebhookDeliveriesResponseData = WebhookDelivery & {
  endpoint: { url: string };
};

export function RetryWebhookDeliveryRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`webhooks/deliveries/${id}/retry`, {
        retry: 0,
        timeout: 20_000,
      });
      return response.json<WebhookDelivery>();
    },
    retry: false,
    onSuccess: (delivery) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", "deliveries"] });
      if (delivery.status === "SUCCESS") {
        toast.success("Webhook delivery retried successfully.");
      } else {
        toast.error(delivery.error ?? "Webhook delivery retry failed.");
      }
    },
    onError: apiErrorHandler,
  });
}

export function FindAllWebhookDeliveriesRequest(
  paginationData: PaginatedRequest & { search?: string },
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: ["webhooks", "deliveries", paginationData],
    queryFn: async () => {
      const response = await api.get(`webhooks/deliveries`, {
        searchParams: paginationData,
      });
      return await response.json<
        PaginatedAPIResponse<WebhookDeliveriesResponseData>
      >();
    },
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}

export function FindAllWebhookEndpointDeliveriesRequest(
  endpointId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["webhooks", "deliveries", "endpoint", endpointId],
    queryFn: async () => {
      const response = await api.get(
        `webhooks/deliveries/endpoint/${endpointId}`,
      );
      return await response.json<PaginatedAPIResponse<WebhookDelivery>>();
    },
    enabled: options?.enabled,
  });
}

export type TestWebhookEndpointResponse = {
  success: boolean;
  statusCode: number | null;
  error: string | null;
};

export function TestWebhookEndpointRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`webhooks/endpoints/${id}/test`, {
        retry: 0,
        timeout: 20_000,
      });
      return response.json<TestWebhookEndpointResponse>();
    },
    retry: false,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Webhook test succeeded (HTTP ${result.statusCode}).`);
      } else {
        toast.error(result.error ?? "Webhook endpoint test failed.");
      }
    },
    onError: apiErrorHandler,
  });
}

export function ToggleWebhookEndpointRequest() {
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await api.patch(`webhooks/endpoints/${id}/toggle`, { json: { enabled } });
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", "endpoints"] });
      toast.success(
        enabled ? "Webhook endpoint enabled." : "Webhook endpoint disabled.",
      );
    },
    onError: apiErrorHandler,
  });
}
