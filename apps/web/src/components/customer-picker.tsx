import { useEffect, useState, type ComponentProps } from "react";
import { CaretUpDownIcon } from "@phosphor-icons/react";
import {
  FindAllCustomersRequest,
  GetCustomerDetailsRequest,
  type Customer,
} from "@/http/customers-http";
import { cn } from "@/lib/utils";
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

type CustomerPickerProps = Omit<
  ComponentProps<typeof Button>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
};

export function CustomerPicker({
  value,
  onChange,
  className,
  disabled,
  ...props
}: CustomerPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState({ search: "", page: 1 });

  const {
    data: response,
    isPending,
    isFetching,
    isError,
    isPlaceholderData,
    refetch,
  } = FindAllCustomersRequest(
    { ...query, limit: 10 },
    { enabled: open && !disabled },
  );
  const { data: customerDetails } = GetCustomerDetailsRequest(value, {
    enabled: Boolean(value) && selectedCustomer?.id !== value,
  });
  const customer =
    selectedCustomer?.id === value ? selectedCustomer : customerDetails;

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

  function handleSelect(customer: Customer) {
    setSelectedCustomer(customer);
    onChange(customer.id);
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
              ? customer
                ? `${customer.name} (${customer.email})`
                : value
              : "Select a customer..."}
          </span>
          <CaretUpDownIcon
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="`w-(--radix-popover-trigger-width max-h-(--radix-popover-content-available-height) gap-0 overflow-hidden p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search customers..."
            aria-label="Search customers"
            maxLength={255}
          />
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
                  Loading customers...
                </p>
              ) : isError ? (
                <div role="alert" className="space-y-2 p-4 text-center text-xs">
                  <p>Unable to load customers.</p>
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
                    {query.search ? "No customers found." : "No customers yet."}
                  </CommandEmpty>
                  <CommandGroup>
                    {response?.data.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        data-checked={customer.id === value}
                        onSelect={() => handleSelect(customer)}
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-medium">
                            {customer.name}
                          </span>
                          <span className="truncate text-muted-foreground">
                            {customer.email}
                          </span>
                          <span className="truncate text-muted-foreground">
                            {customer.id}
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
