import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/ky";
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
  pagination: PaginatedRequest,
) {
  return useQuery({
    queryKey: ["simulation-scenarios", pagination],
    queryFn: async () => {
      const response = await api.get("simulation-scenarios", {
        searchParams: pagination,
      });
      return response.json<PaginatedAPIResponse<SimulationScenario>>();
    },
    placeholderData: keepPreviousData,
  });
}
