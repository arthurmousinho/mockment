import { Paginator } from "@/components/paginator";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { SubscriptionFormDialog } from "@/components/subscription-form-dialog";
import { SubscriptionIntervalBadge } from "@/components/subscription-interval-badge";
import { SubscriptionStatusBadge } from "@/components/subscription-status-badge";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CancelSubscriptionRequest,
  FindAllSubscriptionsRequest,
  PauseSubscriptionRequest,
  ResumeSubscriptionRequest,
  type SubscriptionStatus,
} from "@/http/subscription-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { canChangeSubscriptionStatus } from "@/lib/utils";
import {
  PauseIcon,
  PlayIcon,
  DotsThreeIcon,
  StarIcon,
  XIcon,
  EyeIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

export function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: response,
    isPending,
    isError,
    refetch,
  } = FindAllSubscriptionsRequest({
    page,
    limit,
  });

  const { mutate: pauseRequest, isPending: isPausing } =
    PauseSubscriptionRequest();
  const { mutate: resumeRequest, isPending: isResuming } =
    ResumeSubscriptionRequest();
  const { mutate: cancelRequest, isPending: isCanceling } =
    CancelSubscriptionRequest();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load Subscriptions.
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  function handleChangeStatus(id: string, status: SubscriptionStatus) {
    const requests: Record<SubscriptionStatus, () => void> = {
      ACTIVE: () => resumeRequest(id),
      CANCELED: () => cancelRequest(id),
      PAUSED: () => pauseRequest(id),
      PENDING: () => {},
    };

    requests[status]();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StarIcon size={24} className="font-medium" />
            <h1 className="text-xl font-medium tracking-tight">
              Subscriptions
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            The Subscriptions allows you to create, monitor, and manage
            recurring billing for your customers. Track subscription statuses,
            review billing cycles, handle plan changes or cancellations, and
            simulate the complete subscription lifecycle from a single place.
          </p>
        </div>
        <SubscriptionFormDialog>
          <Button>
            <PlusIcon size={18} />
            New Subscription
          </Button>
        </SubscriptionFormDialog>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Method</TableHead>
            <TableHead className="text-right">Interval</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Next Billing At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {response.data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell className="text-right">
                {formatCurrencyFromCents(item.amountInCents, item.currency)}
              </TableCell>
              <TableCell className="text-right">
                <PaymentMethodBadge method={item.method} />
              </TableCell>
              <TableCell className="text-right">
                <SubscriptionIntervalBadge interval={item.interval} />
              </TableCell>
              <TableCell className="text-right">
                <SubscriptionStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                {formatDateTime(item.nextBillingAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <DotsThreeIcon size={32} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <DropdownMenuItem
                      onSelect={(event) => event.preventDefault()}
                    >
                      <EyeIcon size={32} />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        !canChangeSubscriptionStatus(item.status, "ACTIVE") ||
                        isResuming
                      }
                      onClick={() => handleChangeStatus(item.id, "ACTIVE")}
                    >
                      <PlayIcon size={32} />
                      Resume
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        !canChangeSubscriptionStatus(item.status, "PAUSED") ||
                        isPausing
                      }
                      onClick={() => handleChangeStatus(item.id, "PAUSED")}
                    >
                      <PauseIcon size={32} />
                      Pause
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        !canChangeSubscriptionStatus(item.status, "CANCELED") ||
                        isCanceling
                      }
                      onClick={() => handleChangeStatus(item.id, "CANCELED")}
                    >
                      <XIcon size={32} />
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {response.data?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-muted-foreground"
              >
                No Subscriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter className="w-full bg-transparent">
          <TableRow>
            <TableCell colSpan={7} className="w-full py-2">
              <Paginator
                pagination={response.pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
