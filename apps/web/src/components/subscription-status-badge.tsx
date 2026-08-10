/* eslint-disable */
import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "@/http/subscription-http";

import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ProhibitIcon,
  ClockIcon,
} from "@phosphor-icons/react";

type SubscriptionStatusBadgeProps = {
  status: SubscriptionStatus;
  className?: string;
};

export const SUBSCRIPTION_STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  ACTIVE: {
    label: "Active",
    icon: CheckCircleIcon,
    className:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
  },
  PENDING: {
    label: "Pending",
    icon: ClockIcon,
    className:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-900",
  },
  PAUSED: {
    label: "Paused",
    icon: ClockIcon,
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900",
  },
  CANCELED: {
    label: "Canceled",
    icon: ProhibitIcon,
    className:
      "bg-red-100 text-red-600 border-red-200 dark:bg-red-900 dark:text-red-400 dark:border-red-800",
  },
} as const;

export function SubscriptionStatusBadge({
  status,
  className,
}: SubscriptionStatusBadgeProps) {
  const {
    label,
    icon: Icon,
    className: statusClassName,
  } = SUBSCRIPTION_STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1", statusClassName, className)}
    >
      <Icon size={14} weight="bold" />
      {label}
    </Badge>
  );
}
