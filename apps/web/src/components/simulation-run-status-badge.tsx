import {
  CheckCircleIcon,
  ClockIcon,
  ProhibitIcon,
  SkipForwardIcon,
  SpinnerGapIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import type {
  SimulationRunStatus,
  SimulationStepRunStatus,
} from "@/http/simulations-http";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: ClockIcon,
    color: "bg-muted text-muted-foreground",
  },
  RUNNING: {
    label: "Running",
    icon: SpinnerGapIcon,
    color:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircleIcon,
    color:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  },
  FAILED: {
    label: "Failed",
    icon: XCircleIcon,
    color: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  CANCELED: {
    label: "Canceled",
    icon: ProhibitIcon,
    color: "bg-muted text-muted-foreground",
  },
  SKIPPED: {
    label: "Skipped",
    icon: SkipForwardIcon,
    color: "bg-muted text-muted-foreground",
  },
};

export function SimulationRunStatusBadge({
  status,
}: {
  status: SimulationRunStatus | SimulationStepRunStatus;
}) {
  const { label, icon: Icon, color } = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5", color)}>
      <Icon
        className={
          status === "RUNNING"
            ? "animate-spin motion-reduce:animate-none"
            : undefined
        }
      />
      {label}
    </Badge>
  );
}
