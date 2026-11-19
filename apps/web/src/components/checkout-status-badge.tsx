import { Badge } from "@/components/ui/badge";
import type { CheckoutStatus } from "@/http/checkout-http";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ClockIcon,
  HourglassIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";

type CheckoutStatusBadgeProps = {
  status: CheckoutStatus;
  className?: string;
};

const CHECKOUT_STATUS_CONFIG: Record<
  CheckoutStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  OPEN: {
    label: "Open",
    icon: ClockIcon,
    className:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircleIcon,
    className:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
  },
  CANCELED: {
    label: "Canceled",
    icon: ProhibitIcon,
    className:
      "bg-red-100 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  },
  EXPIRED: {
    label: "Expired",
    icon: HourglassIcon,
    className:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-900",
  },
};

export function CheckoutStatusBadge({
  status,
  className,
}: CheckoutStatusBadgeProps) {
  const {
    label,
    icon: Icon,
    className: statusClassName,
  } = CHECKOUT_STATUS_CONFIG[status];

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
