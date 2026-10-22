import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FindAllWebhookEndpointDeliveriesRequest } from "@/http/webhooks-http";
import { formatDateTime } from "@/lib/formatters";
import { useState, type ReactNode } from "react";
import { StatusCodeBadge } from "./status-code-badge";

type WebhookEndpointDeliveriesSheetProps = {
  endpointId: string;
  children: ReactNode;
};

export function WebhookEndpointDeliveriesSheet({
  endpointId,
  children,
}: WebhookEndpointDeliveriesSheetProps) {
  const [open, setOpen] = useState(false);

  const {
    data: response,
    isPending,
    isError,
    refetch,
  } = FindAllWebhookEndpointDeliveriesRequest(endpointId, {
    enabled: open,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="gap-0 overflow-hidden data-[side=right]:sm:max-w-3xl data-[side=right]:xl:max-w-[60vw]">
        <SheetHeader>
          <SheetTitle>Webhook Endpoint Deliveries</SheetTitle>
          <SheetDescription>
            History of deliveries attempts sent to webhook this endpoint.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-4 sm:px-4">
          {isPending && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-10">
              <p className="text-sm text-muted-foreground">
                Failed to load deliveries.
              </p>
              <Button onClick={() => refetch()}>Try again</Button>
            </div>
          )}

          {!isPending && !isError && (
            <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Status</TableHead>
                    <TableHead>Status Code</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead className="text-right">Delivered At</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {response?.data.map((delivery) => {
                    return (
                      <TableRow key={delivery.id} className="cursor-pointer">
                        <TableCell>
                          <Badge
                            variant={
                              delivery.status === "SUCCESS"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {delivery.status === "SUCCESS"
                              ? "Success"
                              : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusCodeBadge statusCode={delivery.statusCode} />
                        </TableCell>
                        <TableCell className="min-w-40 max-w-80 whitespace-normal break-all">
                          <span className="text-destructive">
                            {delivery.error ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {delivery.deliveredAt
                            ? formatDateTime(delivery.deliveredAt)
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {response?.data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No deliveries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
