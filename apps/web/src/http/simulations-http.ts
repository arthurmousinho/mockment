import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorHandler } from "@/lib/ky";
import { queryClient } from "@/lib/query-client";
import { availableStepsSchema } from "@/lib/simulation-editor";
import type { PaginatedAPIResponse, PaginatedRequest } from "@/types/http.type";

export type SimulationScenarioStep = {
  name: string;
  action: string;
  input?: Record<string, unknown>;
};

export type SimulationScenario = {
  id: string;
  name: string;
  description: string | null;
  stepIntervalMs: number | null;
  steps: SimulationScenarioStep[];
  createdAt: string;
  updatedAt: string;
};

export function FindAllSimulationScenariosRequest(
  pagination: PaginatedRequest & { search?: string },
) {
  return useQuery({
    queryKey: ["simulation-scenarios", pagination],
    queryFn: async () => {
      const response = await api.get("simulation/scenarios", {
        searchParams: pagination,
      });
      return response.json<PaginatedAPIResponse<SimulationScenario>>();
    },
    placeholderData: keepPreviousData,
  });
}

export type CreateSimulationScenarioInput = {
  name: string;
  description?: string;
  stepIntervalMs?: number | null;
  steps: SimulationScenarioStep[];
};

export type UpdateSimulationScenarioInput = Omit<
  CreateSimulationScenarioInput,
  "description" | "stepIntervalMs"
> & {
  description: string | null;
  stepIntervalMs: number | null;
};

export function CreateSimulationScenarioRequest() {
  return useMutation({
    mutationFn: async (input: CreateSimulationScenarioInput) => {
      const response = await api.post("simulation/scenarios", { json: input });
      return response.json<SimulationScenario>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation-scenarios"] });
      toast.success("Simulation scenario created.");
    },
    onError: apiErrorHandler,
  });
}

export function DuplicateSimulationScenarioRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`simulation/scenarios/${id}/duplicate`, {
        retry: 0,
      });
      return response.json<SimulationScenario>();
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation-scenarios"] });
      toast.success("Simulation scenario duplicated.");
    },
    onError: apiErrorHandler,
  });
}

export function UpdateSimulationScenarioRequest() {
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateSimulationScenarioInput & { id: string }) => {
      const response = await api.patch(`simulation/scenarios/${id}`, {
        json: input,
      });
      return response.json<SimulationScenario>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation-scenarios"] });
      toast.success("Simulation scenario updated.");
    },
    onError: apiErrorHandler,
  });
}

export function DeleteSimulationScenarioRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`simulation/scenarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation-scenarios"] });
      toast.success("Simulation scenario deleted.");
    },
    onError: apiErrorHandler,
  });
}

export function FindAvailableSimulationStepsRequest(enabled = true) {
  return useQuery({
    queryKey: ["simulation-steps", "grouped", "checkouts"],
    enabled,
    queryFn: async () => {
      const response = await api.get("simulation/steps");
      return availableStepsSchema.parse(await response.json());
    },
  });
}

export type SimulationRunStatus =
  "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELED";
export type SimulationStepRunStatus =
  "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";

export type SimulationRun = {
  id: string;
  scenarioId: string;
  status: SimulationRunStatus;
  currentStep: number;
  totalSteps: number;
  error: unknown;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SimulationStepRun = {
  id: string;
  runId: string;
  stepIndex: number;
  status: SimulationStepRunStatus;
  input: unknown;
  output: unknown;
  error: unknown;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SimulationRunDetails = SimulationRun & {
  steps: SimulationStepRun[];
};

export function CreateSimulationRunRequest() {
  return useMutation({
    mutationFn: async (scenarioId: string) => {
      const response = await api.post(
        `simulation/scenarios/${scenarioId}/runs`,
        { retry: 0 },
      );
      return response.json<SimulationRun>();
    },
    retry: false,
    onError: apiErrorHandler,
  });
}

export function FindSimulationRunRequest(id: string) {
  const query = useQuery({
    queryKey: ["simulation-runs", id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      const response = await api.get(`simulation/runs/${id}`, { signal });
      return response.json<SimulationRunDetails>();
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const status = query.data?.status;

  useEffect(() => {
    if (!id || (status !== "PENDING" && status !== "RUNNING")) return;

    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/?$/, "/");
    const url = new URL(
      `simulation/runs/${encodeURIComponent(id)}/stream`,
      new URL(baseUrl, window.location.href),
    );
    const stream = new EventSource(url);
    stream.onmessage = (event) => {
      const run = JSON.parse(event.data) as SimulationRunDetails;
      queryClient.setQueryData(["simulation-runs", id], run);
      if (run.status !== "PENDING" && run.status !== "RUNNING") {
        stream.close();
      }
    };
    return () => stream.close();
  }, [id, status]);

  return query;
}

export function FindSimulationScenarioRunsRequest(
  id: string,
  pagination: PaginatedRequest,
) {
  return useQuery({
    queryKey: ["simulation-runs", "scenario", id, pagination],
    queryFn: async ({ signal }) => {
      const response = await api.get(`simulation/scenarios/${id}/runs`, {
        searchParams: pagination,
        signal,
      });
      return response.json<PaginatedAPIResponse<SimulationRun>>();
    },
  });
}
