import { ListingPageSkeleton } from "@/components/listing-page-skeleton";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { ListingSearch } from "@/components/listing-search";
import { Paginator } from "@/components/paginator";
import { RefetchButton } from "@/components/refetch-button";
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
import {
  CancelInvoiceRequest,
  DownloadInvoicePdfRequest,
  FindAllInvoicesRequest,
  IssueInvoiceRequest,
  ProcessInvoiceRequest,
} from "@/http/invoices-http";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { InvoiceFormDialog } from "@/components/invoice-form-dialog";
import { InvoiceDetailsDialog } from "@/components/invoice-details-dialog";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import {
  DotsThreeIcon,
  ArrowClockwiseIcon,
  CheckIcon,
  DownloadSimpleIcon,
  EyeIcon,
  PlusIcon,
  ReceiptIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

export function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  const {
    data: response,
    isPending,
    isFetching,
    isError,
    refetch,
  } = FindAllInvoicesRequest({ page, limit, search });
  const { mutate: processInvoice, isPending: isProcessing } =
    ProcessInvoiceRequest();
  const { mutate: issueInvoice, isPending: isIssuing } = IssueInvoiceRequest();
  const { mutate: downloadInvoicePdf, isPending: isDownloading } =
    DownloadInvoicePdfRequest();
  const { mutate: cancelInvoice, isPending: isCanceling } =
    CancelInvoiceRequest();

  if (isPending) return <ListingPageSkeleton columns={6} rows={limit} />;
  if (isError)
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load invoices.
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );

  return (
    <div className="min-w-0 space-y-4">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <ReceiptIcon size={24} />
            <h1 className="text-xl font-medium tracking-tight">Invoices</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Browse invoices created for payment transactions, including
            customer, amount, status, and issue date.
          </p>
        </div>
      </header>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ListingSearch
          className="min-w-0 flex-[1_1_30rem]"
          value={searchInput}
          appliedValue={search}
          onValueChange={setSearchInput}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          label="Search invoices"
          inputLabel="Invoice ID, payment ID, customer name, or tax ID"
          placeholder="Search invoices..."
        />
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
          <InvoiceFormDialog>
            <Button>
              <PlusIcon size={18} />
              New Invoice
            </Button>
          </InvoiceFormDialog>
        </div>
      </header>
      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {response.data.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="max-w-52 truncate">{invoice.id}</TableCell>
              <TableCell>{invoice.customerName}</TableCell>
              <TableCell className="text-right">
                {formatCurrencyFromCents(
                  invoice.amountInCents,
                  invoice.currency,
                )}
              </TableCell>
              <TableCell className="text-right">
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right">
                {formatDateTime(invoice.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <DotsThreeIcon size={32} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <InvoiceDetailsDialog id={invoice.id}>
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                      >
                        <EyeIcon size={32} />
                        Details
                      </DropdownMenuItem>
                    </InvoiceDetailsDialog>
                    <DropdownMenuItem
                      disabled={invoice.status !== "CREATED" || isProcessing}
                      onClick={() => processInvoice(invoice.id)}
                    >
                      <ArrowClockwiseIcon size={32} />
                      Process
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={invoice.status !== "PROCESSING" || isIssuing}
                      onClick={() => issueInvoice(invoice.id)}
                    >
                      <CheckIcon size={32} />
                      Issue
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={invoice.status !== "ISSUED" || isDownloading}
                      onClick={() => downloadInvoicePdf(invoice.id)}
                    >
                      <DownloadSimpleIcon size={32} />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        !["CREATED", "PROCESSING", "ISSUED"].includes(
                          invoice.status,
                        ) || isCanceling
                      }
                      onClick={() => setPendingCancel(invoice.id)}
                    >
                      <XIcon size={32} />
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {response.data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-muted-foreground"
              >
                {search
                  ? "No invoices match your search."
                  : "No invoices found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="border-t px-2 py-3">
        <Paginator
          pagination={response.pagination}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
        />
      </div>
      <DeleteConfirmationDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => {
          if (!open) setPendingCancel(null);
        }}
        title="Cancel invoice?"
        itemName={pendingCancel ?? ""}
        action="cancel"
        confirmLabel="Cancel invoice"
        pendingLabel="Canceling…"
        isPending={isCanceling}
        onConfirm={() => {
          if (!pendingCancel || isCanceling) return;
          cancelInvoice(pendingCancel, {
            onSuccess: () => setPendingCancel(null),
          });
        }}
      />
    </div>
  );
}
