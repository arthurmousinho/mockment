import { cn } from "@/lib/utils";
import { type EventType } from "@/http/events-http";

type EventTypeBadgeProps = {
  type: EventType;
  className?: string;
};

const EVENT_TYPE_CONFIG: Record<EventType, { className: string }> = {
  PAYMENT_CREATED: {
    className: "text-slate-800 dark:text-slate-300",
  },
  PAYMENT_PROCESSING: {
    className: "text-blue-800 dark:text-blue-300",
  },
  PAYMENT_APPROVED: {
    className: "text-green-800 dark:text-green-300",
  },
  PAYMENT_DECLINED: {
    className: "text-red-800 dark:text-red-300",
  },
  PAYMENT_CANCELED: {
    className: "text-zinc-600 dark:text-zinc-400",
  },
  SUBSCRIPTION_CREATED: {
    className: "text-slate-800 dark:text-slate-300",
  },
  SUBSCRIPTION_ACTIVATED: {
    className: "text-green-800 dark:text-green-300",
  },
  SUBSCRIPTION_RENEWED: {
    className: "text-blue-800 dark:text-blue-300",
  },
  SUBSCRIPTION_PAUSED: {
    className: "text-amber-800 dark:text-amber-300",
  },
  SUBSCRIPTION_RESUMED: {
    className: "text-teal-800 dark:text-teal-300",
  },
  SUBSCRIPTION_CANCELED: {
    className: "text-zinc-600 dark:text-zinc-400",
  },
};

export function EventTypeBadge({ type, className }: EventTypeBadgeProps) {
  const { className: typeClassName } = EVENT_TYPE_CONFIG[type];
  return (
    <span className={cn("font-medium", typeClassName, className)}>{type}</span>
  );
}
