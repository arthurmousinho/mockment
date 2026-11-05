/* eslint-disable */
import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/http/payments-http";
import { cn } from "@/lib/utils";
import {
  ClockIcon,
  SpinnerGapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ProhibitIcon,
  ArrowUUpLeftIcon,
} from "@phosphor-icons/react";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
  className?: string;
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  CREATED: {
    label: "Created",
    icon: ClockIcon,
    className:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
  },
  PROCESSING: {
    label: "Processing",
    icon: SpinnerGapIcon,
    className:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircleIcon,
    className:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
  },
  DECLINED: {
    label: "Declined",
    icon: XCircleIcon,
    className:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  },
  REFUNDED: {
    label: "Refunded",
    icon: ArrowUUpLeftIcon,
    className:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900",
  },
  CANCELED: {
    label: "Canceled",
    icon: ProhibitIcon,
    className:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
  },
} as const;

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const {
    label,
    icon: Icon,
    className: statusClassName,
  } = PAYMENT_STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1", statusClassName, className)}
    >
      <Icon
        size={14}
        weight="bold"
        className={cn(status === "PROCESSING" && "animate-spin")}
      />
      {label}
    </Badge>
  );
}
