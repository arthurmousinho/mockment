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
    queryKey: ["simulation-steps", "grouped"],
    enabled,
    queryFn: async () => {
      const response = await api.get("simulation/steps");
      return availableStepsSchema.parse(await response.json());
    },
  });
}
