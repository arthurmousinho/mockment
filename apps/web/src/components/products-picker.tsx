import { useEffect, useState } from "react";
import {
  CaretUpDownIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { FindAllProductsRequest, type Product } from "@/http/products-http";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
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

type ProductSelection = { productId: string; quantity: number };

type ProductsPickerProps = {
  value: ProductSelection[];
  onChange: (value: ProductSelection[]) => void;
};

export function ProductsPicker({ value, onChange }: ProductsPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState({ search: "", page: 1 });
  const [selected, setSelected] = useState<Product[]>([]);
  const { data, isPending, isError, isPlaceholderData, refetch } =
    FindAllProductsRequest({ ...query, limit: 10 });

  useEffect(() => {
    const timeout = setTimeout(
      () =>
        setQuery((current) =>
          current.search === search.trim()
            ? current
            : { search: search.trim(), page: 1 },
        ),
      300,
    );
    return () => clearTimeout(timeout);
  }, [search]);

  function select(product: Product) {
    setSelected((items) => [
      ...items.filter((item) => item.id !== product.id),
      product,
    ]);
    onChange([...value, { productId: product.id, quantity: 1 }]);
  }

  const selectedDetails = value.map((item) => ({
    ...item,
    product: selected.find((product) => product.id === item.productId),
  }));
  const currency = selectedDetails[0]?.product?.currency;
  const canShowTotal =
    currency &&
    selectedDetails.every(
      (item) =>
        item.product?.currency === currency &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0,
    );
  const total = selectedDetails.reduce(
    (sum, item) => sum + (item.product?.priceInCents ?? 0) * item.quantity,
    0,
  );

  return (
    <div className="space-y-3">
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            {value.length
              ? `${value.length} product${value.length === 1 ? "" : "s"} selected`
              : "Add a product..."}
            <CaretUpDownIcon className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search products..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {(isPending ||
                isPlaceholderData ||
                search.trim() !== query.search) && (
                <div className="p-3 text-sm">Loading products...</div>
              )}
              {isError && (
                <div className="p-3 text-sm">
                  Could not load products.{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => refetch()}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {!isPending && !isError && (
                <CommandEmpty>No products found.</CommandEmpty>
              )}
              <CommandGroup>
                {data?.data.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    disabled={
                      !product.enabled ||
                      value.some((item) => item.productId === product.id)
                    }
                    onSelect={() => select(product)}
                  >
                    <span className="flex-1 truncate">
                      {product.name}
                      {!product.enabled && " (disabled)"}
                    </span>
                    <span>
                      {formatCurrencyFromCents(
                        product.priceInCents,
                        product.currency,
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {data && (
              <div className="flex items-center justify-between border-t p-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    !data.pagination.hasPreviousPage || isPlaceholderData
                  }
                  onClick={() =>
                    setQuery((current) => ({
                      ...current,
                      page: current.page - 1,
                    }))
                  }
                >
                  Previous
                </Button>
                <span className="text-sm">Page {query.page}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasNextPage || isPlaceholderData}
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
      <Card size="sm" aria-label="Order summary">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
          <CardAction>
            <Badge variant="secondary">
              {value.length} {value.length === 1 ? "product" : "products"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          {value.length === 0 ? (
            <p className="px-3 text-muted-foreground">No products selected.</p>
          ) : (
            <ScrollArea className="h-60">
              <div className="divide-y">
                {selectedDetails.map(({ productId, quantity, product }) => (
                  <div key={productId} className="space-y-2 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {product?.name ?? productId}
                        </p>
                        {product && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrencyFromCents(
                              product.priceInCents,
                              product.currency,
                            )}{" "}
                            each
                          </p>
                        )}
                      </div>
                      {product && (
                        <span className="shrink-0 text-sm font-medium">
                          {formatCurrencyFromCents(
                            product.priceInCents * quantity,
                            product.currency,
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Qty</span>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Decrease quantity for ${product?.name ?? productId}`}
                            disabled={quantity <= 1}
                            onClick={() =>
                              onChange(
                                value.map((entry) =>
                                  entry.productId === productId
                                    ? {
                                        ...entry,
                                        quantity: Math.max(1, quantity - 1),
                                      }
                                    : entry,
                                ),
                              )
                            }
                          >
                            <MinusIcon />
                          </Button>
                          <Input
                            aria-label={`Quantity for ${product?.name ?? productId}`}
                            type="number"
                            min="1"
                            max="2147483647"
                            className="h-8 w-20 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            value={quantity}
                            onChange={(event) =>
                              onChange(
                                value.map((entry) =>
                                  entry.productId === productId
                                    ? {
                                        ...entry,
                                        quantity: Number(event.target.value),
                                      }
                                    : entry,
                                ),
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Increase quantity for ${product?.name ?? productId}`}
                            disabled={quantity >= 2147483647}
                            onClick={() =>
                              onChange(
                                value.map((entry) =>
                                  entry.productId === productId
                                    ? {
                                        ...entry,
                                        quantity: Math.min(
                                          2147483647,
                                          Math.max(0, quantity) + 1,
                                        ),
                                      }
                                    : entry,
                                ),
                              )
                            }
                          >
                            <PlusIcon />
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onChange(
                            value.filter(
                              (entry) => entry.productId !== productId,
                            ),
                          )
                        }
                      >
                        <TrashIcon />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2 text-sm font-medium">
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span>
              {canShowTotal && Number.isSafeInteger(total)
                ? formatCurrencyFromCents(total, currency)
                : "—"}
            </span>
          </div>
          {currency &&
            selectedDetails.some(
              (item) => item.product && item.product.currency !== currency,
            ) && (
              <p className="text-xs text-destructive">
                Products must use the same currency.
              </p>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
