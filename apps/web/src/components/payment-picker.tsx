import { useEffect, useState, type ComponentProps } from "react";
import { CaretUpDownIcon } from "@phosphor-icons/react";
import {
  FindAllPaymentsRequest,
  GetPaymentDetailsRequest,
  type Payment,
} from "@/http/payments-http";
import { cn } from "@/lib/utils";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { PaymentStatusBadge } from "./payment-status-badge";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

type PaymentPickerProps = Omit<
  ComponentProps<typeof Button>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  onPaymentSelect?: (payment: Payment) => void;
};

export function PaymentPicker({
  value,
  onChange,
  onPaymentSelect,
  className,
  disabled,
  ...props
}: PaymentPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState({ search: "", page: 1 });

  const {
    data: response,
    isPending,
    isFetching,
    isError,
    isPlaceholderData,
    refetch,
  } = FindAllPaymentsRequest(
    { ...query, limit: 10 },
    { enabled: open && !disabled },
  );
  const { data: paymentDetails } = GetPaymentDetailsRequest(value, {
    enabled: Boolean(value) && selectedPayment?.id !== value,
  });
  const payment =
    selectedPayment?.id === value ? selectedPayment : paymentDetails;

  const isSearching = search.trim() !== query.search;
  const isLoading = isPending || isPlaceholderData || isSearching;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery((current) =>
        current.search === search.trim()
          ? current
          : { search: search.trim(), page: 1 },
      );
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setSearch("");
      setQuery({ search: "", page: 1 });
    }
  }

  function handleSelect(payment: Payment) {
    setSelectedPayment(payment);
    onChange(payment.id);
    onPaymentSelect?.(payment);
    setOpen(false);
  }

  return (
    <Popover modal open={open && !disabled} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          {...props}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {value
              ? payment
                ? `${formatCurrencyFromCents(payment.amountInCents, payment.currency)} (${payment.id})`
                : value
              : "Select a payment..."}
          </span>
          <CaretUpDownIcon
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) max-h-(--radix-popover-content-available-height) gap-0 overflow-hidden p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search payments..."
            aria-label="Search payments"
            maxLength={255}
          />
          <p className="border-b px-3 py-2 text-xs text-muted-foreground">
            Only approved payments can be used for invoices.
          </p>
          <CommandList
            aria-busy={isLoading}
            className="max-h-none overflow-hidden"
          >
            <ScrollArea className="h-[min(18rem,calc(var(--radix-popover-content-available-height)-7rem))]">
              {isLoading ? (
                <p
                  role="status"
                  className="p-4 text-center text-xs text-muted-foreground"
                >
                  Loading payments...
                </p>
              ) : isError ? (
                <div role="alert" className="space-y-2 p-4 text-center text-xs">
                  <p>Unable to load payments.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                  >
                    Try again
                  </Button>
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    {query.search ? "No payments found." : "No payments yet."}
                  </CommandEmpty>
                  <CommandGroup>
                    {response?.data.map((payment) => (
                      <CommandItem
                        key={payment.id}
                        value={payment.id}
                        data-checked={payment.id === value}
                        disabled={payment.status !== "APPROVED"}
                        onSelect={() => handleSelect(payment)}
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-medium">
                            {formatCurrencyFromCents(
                              payment.amountInCents,
                              payment.currency,
                            )}
                          </span>
                          <span className="truncate text-muted-foreground">
                            <PaymentStatusBadge status={payment.status} />
                          </span>
                          <span className="truncate text-muted-foreground">
                            {payment.id}
                          </span>
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </ScrollArea>
          </CommandList>
          {response && response.pagination.totalPages > 1 && !isError && (
            <div className="flex items-center justify-between gap-2 border-t p-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading || !response.pagination.hasPreviousPage}
                onClick={() =>
                  setQuery((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {response.pagination.page} of{" "}
                {response.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading || !response.pagination.hasNextPage}
                onClick={() =>
                  setQuery((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
              >
                Next
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
