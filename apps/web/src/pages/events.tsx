import { RefetchButton } from "@/components/refetch-button";
import { EventDetailsDialog } from "@/components/event-details-dialog";
import { EventTypeBadge } from "@/components/event-type-badge";
import { Paginator } from "@/components/paginator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FindAllEventsRequest } from "@/http/events-http";
import { formatDateTime } from "@/lib/formatters";
import { DotsThreeIcon, EyeIcon, ReceiptIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function EventsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: response,
    isPending,
    isFetching,
    isError,
    refetch,
  } = FindAllEventsRequest({ page, limit });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">Failed to load Events.</p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <ReceiptIcon size={24} className="font-medium" />
            <h1 className="text-xl font-medium tracking-tight">Events</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            The Events section allows you to view the lifecycle of payments and
            subscriptions. Allows to track state changes, recurring billing
            activity, and other relevant events within the payment system.
          </p>
        </div>
        <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead className="text-right">Type</TableHead>
            <TableHead className="text-right">Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {response.data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell className="text-right">
                <EventTypeBadge type={item.type} />
              </TableCell>
              <TableCell className="text-right">
                {formatDateTime(item.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <DotsThreeIcon size={32} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <EventDetailsDialog event={item}>
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                      >
                        <EyeIcon size={32} />
                        Details
                      </DropdownMenuItem>
                    </EventDetailsDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {response.data?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-10 text-center text-muted-foreground"
              >
                No Events found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="border-t px-2 py-3">
        <Paginator
          pagination={response.pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}
