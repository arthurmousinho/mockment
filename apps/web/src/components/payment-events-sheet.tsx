import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FindAllPaymentEventsRequest } from "@/http/payment-events-http";
import { formatDateTime } from "@/lib/formatters";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PaymentEventType } from "./payment-event-type";
import { Paginator } from "./paginator";

type PaymentEventsSheetProps = {
  children: ReactNode;
};

export function PaymentEventsSheet({ children }: PaymentEventsSheetProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: response,
    isPending,
    isError,
    refetch,
  } = FindAllPaymentEventsRequest({ page, limit }, { enabled: open });

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 sm:min-w-[50vw]">
        <SheetHeader>
          <SheetTitle>Payment Events</SheetTitle>
          <SheetDescription>
            History of payment events emitted by the system.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          {isPending && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-10">
              <p className="text-sm text-muted-foreground">
                Failed to load payment events.
              </p>
              <Button onClick={() => refetch()}>Try again</Button>
            </div>
          )}

          {!isPending && !isError && (
            <ScrollArea className="-mx-4 min-h-0 flex-1 px-4">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-8" />
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Created At</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {response?.data.map((event) => {
                    const isExpanded = expandedId === event.id;

                    return (
                      <>
                        <TableRow
                          key={event.id}
                          onClick={() => toggleExpanded(event.id)}
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
                          <TableCell className="max-w-55 truncate font-mono text-xs">
                            {event.paymentId}
                          </TableCell>
                          <TableCell>
                            <PaymentEventType type={event.type} />
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {formatDateTime(event.createdAt)}
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow key={`${event.id}-details`}>
                            <TableCell colSpan={4} className="bg-muted/40 p-0">
                              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-6 py-4 text-sm">
                                <div className="space-y-1">
                                  <dt className="text-xs text-muted-foreground">
                                    Event ID
                                  </dt>
                                  <dd className="break-all font-mono text-xs">
                                    {event.id}
                                  </dd>
                                </div>
                                <div className="space-y-1">
                                  <dt className="text-xs text-muted-foreground">
                                    Payment ID
                                  </dt>
                                  <dd className="break-all font-mono text-xs">
                                    {event.paymentId}
                                  </dd>
                                </div>
                                <div className="col-span-2 space-y-1">
                                  <dt className="text-xs text-muted-foreground">
                                    Payload
                                  </dt>
                                  <dd>
                                    <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
                                      {JSON.stringify(event.payload, null, 2)}
                                    </pre>
                                  </dd>
                                </div>
                              </dl>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}

                  {response?.data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No payment events found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
          {response && (
            <footer className="px-4">
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
