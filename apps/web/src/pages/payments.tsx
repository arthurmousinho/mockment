import { Paginator } from "@/components/paginator";
import { PaymentCurrencyBadge } from "@/components/payment-currency-badge";
import { PaymentDetailsDialog } from "@/components/payment-details-dialog";
import { PaymentEventsSheet } from "@/components/payment-events-sheet";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
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
  ApprovePaymentRequest,
  CancelPaymentRequest,
  DeclinePaymentRequest,
  FindAllPaymentsRequest,
  ProcessPaymentRequest,
  type PaymentStatus,
} from "@/http/payments-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { canChangePaymentStatus } from "@/lib/utils";
import {
  CheckIcon,
  ArrowClockwiseIcon,
  ProhibitIcon,
  DotsThreeIcon,
  CurrencyCircleDollarIcon,
  XIcon,
  EyeIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

export function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: response,
    isPending,
    isError,
    refetch,
  } = FindAllPaymentsRequest({ page, limit });

  const { mutate: proccessRequest, isPending: isProcessing } =
    ProcessPaymentRequest();
  const { mutate: approveRequest, isPending: isApproving } =
    ApprovePaymentRequest();
  const { mutate: declineRequest, isPending: isDeclining } =
    DeclinePaymentRequest();
  const { mutate: cancelRequest, isPending: isCanceling } =
    CancelPaymentRequest();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load Payments.
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  function handleChangeStatus(id: string, status: PaymentStatus) {
    const requests: Record<PaymentStatus, () => void> = {
      CREATED: () => {},
      PROCESSING: () => proccessRequest(id),
      APPROVED: () => approveRequest(id),
      DECLINED: () => declineRequest(id),
      CANCELED: () => cancelRequest(id),
    };

    requests[status]();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CurrencyCircleDollarIcon size={24} className="font-medium" />
            <h1 className="text-xl font-medium tracking-tight">Payments</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            The Payments section allows you to create, monitor, and manage
            payment transactions processed through your gateway. Track payment
            statuses, review transaction details, handle refunds, and
            troubleshoot payment flows from a single place.
          </p>
        </div>
        <PaymentEventsSheet>
          <Button variant="secondary">
            <ReceiptIcon size={18} />
            View All Events
          </Button>
        </PaymentEventsSheet>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Currency</TableHead>
            <TableHead className="text-right">Method</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {response.data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell className="text-right">
                {formatCurrencyFromCents(item.amountInCents, item.currency)}
              </TableCell>
              <TableCell className="text-right">
                <PaymentCurrencyBadge currency={item.currency} />
              </TableCell>
              <TableCell className="text-right">
                <PaymentMethodBadge method={item.method} />
              </TableCell>
              <TableCell className="text-right">
                <PaymentStatusBadge status={item.status} />
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
                    <PaymentDetailsDialog id={item.id}>
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                      >
                        <EyeIcon size={32} />
                        Details
                      </DropdownMenuItem>
                    </PaymentDetailsDialog>
                    <DropdownMenuItem
                      disabled={
                        !canChangePaymentStatus(item.status, "PROCESSING") ||
                        isProcessing
                      }
                      onClick={() => handleChangeStatus(item.id, "PROCESSING")}
                    >
                      <ArrowClockwiseIcon size={32} />
                      Process
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        !canChangePaymentStatus(item.status, "APPROVED") ||
                        isApproving
                      }
                      onClick={() => handleChangeStatus(item.id, "APPROVED")}
                    >
                      <CheckIcon size={32} />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        !canChangePaymentStatus(item.status, "DECLINED") ||
                        isDeclining
                      }
                      onClick={() => handleChangeStatus(item.id, "DECLINED")}
                    >
                      <ProhibitIcon size={32} />
                      Decline
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        !canChangePaymentStatus(item.status, "CANCELED") ||
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
                No Payments found.
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
