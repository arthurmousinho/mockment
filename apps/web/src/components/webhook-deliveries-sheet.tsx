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
import { FindAllWebhookDeliveriesRequest } from "@/http/webhooks-http";
import { formatDateTime } from "@/lib/formatters";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Fragment, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StatusCodeBadge } from "./status-code-badge";
import { Paginator } from "./paginator";

type WebhookDeliveriesSheetProps = {
  children: ReactNode;
};

export function WebhookDeliveriesSheet({
  children,
}: WebhookDeliveriesSheetProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: response,
    isPending,
    isError,
    refetch,
  } = FindAllWebhookDeliveriesRequest({ page, limit }, { enabled: open });

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="gap-0 overflow-hidden data-[side=right]:sm:max-w-3xl data-[side=right]:xl:max-w-[60vw]">
        <SheetHeader>
          <SheetTitle>All Webhook Deliveries</SheetTitle>
          <SheetDescription>
            History of deliveries attempts sent to webhook endpoints.
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
                    <TableHead className="w-8" />
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Status Code</TableHead>
                    <TableHead className="text-right">Delivered At</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {response.data?.map((delivery) => {
                    const isExpanded = expandedId === delivery.id;

                    return (
                      <Fragment key={delivery.id}>
                        <TableRow
                          key={delivery.id}
                          onClick={() => toggleExpanded(delivery.id)}
                          className="cursor-pointer"
                        >
                          <TableCell>
                            <CaretDownIcon
                              size={16}
                              className={cn(
                                "text-muted-foreground transition-transform",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </TableCell>
                          <TableCell className="max-w-55 truncate">
                            {delivery.endpoint.url}
                          </TableCell>
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
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {delivery.deliveredAt
                              ? formatDateTime(delivery.deliveredAt)
                              : "—"}
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow key={`${delivery.id}-details`}>
                            <TableCell
                              colSpan={5}
                              className="bg-muted/40 p-0 whitespace-normal"
                            >
                              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-3 py-4 text-sm sm:grid-cols-2 sm:px-6">
                                <div className="space-y-1">
                                  <dt className="text-xs text-muted-foreground">
                                    Delivery ID
                                  </dt>
                                  <dd className="break-all font-mono text-xs">
                                    {delivery.id}
                                  </dd>
                                </div>
                                <div className="space-y-1">
                                  <dt className="text-xs text-muted-foreground">
                                    Endpoint ID
                                  </dt>
                                  <dd className="break-all font-mono text-xs">
                                    {delivery.endpointId}
                                  </dd>
                                </div>
                                <div className="space-y-1">
                                  <dt className="text-xs text-muted-foreground">
                                    Event ID
                                  </dt>
                                  <dd className="break-all font-mono text-xs">
                                    {delivery.eventId}
                                  </dd>
                                </div>
                                <div className="space-y-1">
                                  <dt className="text-xs text-muted-foreground">
                                    Created At
                                  </dt>
                                  <dd className="text-xs">
                                    {formatDateTime(delivery.createdAt)}
                                  </dd>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                  <dt className="text-xs text-muted-foreground">
                                    Error
                                  </dt>
                                  <dd className="text-xs break-all text-destructive">
                                    {delivery.error ?? "—"}
                                  </dd>
                                </div>
                              </dl>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}

                  {response.data?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
          {response && (
            <footer className="shrink-0 border-t pt-3">
              <Paginator
                pagination={response.pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </footer>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
