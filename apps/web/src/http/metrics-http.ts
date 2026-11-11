import { api } from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";

export type Metrics = {
    totalPaymentVolume: number;
    approvedVolume: number;
    approvalRate: number;
    totalTransactions: number;
    averageTicket: number;
    refundedVolume: number;
};

export function GetMetricsRequest() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: async () => (await api.get("payments/metrics")).json<Metrics>(),
  });
}
