import { useEffect, useState, type ComponentProps } from "react";
import { CaretUpDownIcon } from "@phosphor-icons/react";
import {
  FindAllSubscriptionsRequest,
  GetSubscriptionDetailsRequest,
  type Subscription,
} from "@/http/subscription-http";
import { cn } from "@/lib/utils";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { SubscriptionStatusBadge } from "./subscription-status-badge";
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

type SubscriptionPickerProps = Omit<
  ComponentProps<typeof Button>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  onSubscriptionSelect?: (subscription: Subscription) => void;
  pendingOnly?: boolean;
};

export function SubscriptionPicker({
  value,
  onChange,
  onSubscriptionSelect,
  pendingOnly = false,
  className,
  disabled,
  ...props
}: SubscriptionPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState({ search: "", page: 1 });

  const {
    data: response,
    isPending,
    isFetching,
    isError,
    isPlaceholderData,
    refetch,
  } = FindAllSubscriptionsRequest(
    { ...query, limit: 10 },
    { enabled: open && !disabled },
  );
  const { data: subscriptionDetails } = GetSubscriptionDetailsRequest(value, {
    enabled: Boolean(value) && selectedSubscription?.id !== value,
  });
  const subscription =
    selectedSubscription?.id === value
      ? selectedSubscription
      : subscriptionDetails;

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

  function handleSelect(subscription: Subscription) {
    setSelectedSubscription(subscription);
    onChange(subscription.id);
    onSubscriptionSelect?.(subscription);
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
              ? subscription
                ? `${formatCurrencyFromCents(subscription.amountInCents, subscription.currency)} (${subscription.id})`
                : value
              : "Select a subscription..."}
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
            placeholder="Search subscriptions..."
            aria-label="Search subscriptions"
            maxLength={255}
          />
          {pendingOnly && (
            <p className="border-b px-3 py-2 text-xs text-muted-foreground">
              Only pending subscriptions can be used for checkouts.
            </p>
          )}
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
                  Loading subscriptions...
                </p>
              ) : isError ? (
                <div role="alert" className="space-y-2 p-4 text-center text-xs">
                  <p>Unable to load subscriptions.</p>
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
                    {query.search
                      ? "No subscriptions found."
                      : "No subscriptions yet."}
                  </CommandEmpty>
                  <CommandGroup>
                    {response?.data.map((subscription) => (
                      <CommandItem
                        key={subscription.id}
                        value={subscription.id}
                        data-checked={subscription.id === value}
                        disabled={
                          pendingOnly && subscription.status !== "PENDING"
                        }
                        onSelect={() => handleSelect(subscription)}
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-medium">
                            {formatCurrencyFromCents(
                              subscription.amountInCents,
                              subscription.currency,
                            )}
                          </span>
                          <span className="truncate text-muted-foreground">
                            <SubscriptionStatusBadge
                              status={subscription.status}
                            />
                          </span>
                          <span className="truncate text-muted-foreground">
                            {subscription.id}
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
