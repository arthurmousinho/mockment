import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorHandler } from "@/lib/ky";
import { queryClient } from "@/lib/query-client";
import type {
  SimulationScenario,
  SimulationScenarioStep,
} from "./simulation-scenarios-http";

export type CreateSimulationScenarioInput = {
  name: string;
  description?: string;
  stepIntervalMs?: number | null;
  steps: SimulationScenarioStep[];
};

export function CreateSimulationScenarioRequest() {
  return useMutation({
    mutationFn: async (input: CreateSimulationScenarioInput) => {
      const response = await api.post("simulation-scenarios", { json: input });
      return response.json<SimulationScenario>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation-scenarios"] });
      toast.success("Simulation scenario created.");
    },
    onError: apiErrorHandler,
  });
}
