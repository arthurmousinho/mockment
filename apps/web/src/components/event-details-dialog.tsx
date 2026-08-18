import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventTypeBadge } from "@/components/event-type-badge";
import { formatDateTime } from "@/lib/formatters";
import { DetailRow } from "./ui/detail-row";
import { type Event } from "@/http/events-http";

type EventDetailsDialogProps = {
  event: Event;
  children: ReactNode;
};

export function EventDetailsDialog({
  event,
  children,
}: EventDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event details</DialogTitle>
          <DialogDescription>
            Full information about this event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2.5">
            <DetailRow label="ID">{event.id}</DetailRow>
            <DetailRow label="Type">
              <EventTypeBadge type={event.type} />
            </DetailRow>
            {event.paymentId && (
              <DetailRow label="Payment ID">{event.paymentId}</DetailRow>
            )}
            {event.subscriptionId && (
              <DetailRow label="Subscription ID">
                {event.subscriptionId}
              </DetailRow>
            )}
            <DetailRow label="Created at">
              {formatDateTime(event.createdAt)}
            </DetailRow>
          </div>
          <div>
            <span className="text-sm text-foreground mb-2">Payload</span>
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
              <code>{JSON.stringify(event.payload, null, 2)}</code>
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
