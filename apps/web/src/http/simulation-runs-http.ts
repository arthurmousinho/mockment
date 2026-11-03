import { useMutation, useQuery } from "@tanstack/react-query";
import { api, apiErrorHandler } from "@/lib/ky";

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
  return useQuery({
    queryKey: ["simulation-runs", id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      const response = await api.get(`simulation/runs/${id}`, { signal });
      return response.json<SimulationRunDetails>();
    },
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "RUNNING" ? 2000 : false;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}
