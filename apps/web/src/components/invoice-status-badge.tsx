import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/http/invoices-http";
import { cn } from "@/lib/utils";
import {
  ClockIcon,
  SpinnerGapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";

type InvoiceStatusBadgeProps = {
  status: InvoiceStatus;
  className?: string;
};

const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
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
  ISSUED: {
    label: "Issued",
    icon: CheckCircleIcon,
    className:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircleIcon,
    className:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  },
  CANCELED: {
    label: "Canceled",
    icon: ProhibitIcon,
    className:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
  },
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const { label, icon: Icon, className: statusClassName } =
    INVOICE_STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className={cn("gap-1", statusClassName, className)}>
      <Icon size={14} weight="bold" className={cn(status === "PROCESSING" && "animate-spin")} />
      {label}
    </Badge>
  );
}
