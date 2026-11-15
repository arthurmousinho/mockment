import { ListingPageSkeleton } from "@/components/listing-page-skeleton";
import { ListingSearch } from "@/components/listing-search";
import { Paginator } from "@/components/paginator";
import { ProductFormDialog } from "@/components/product-form-dialog";
import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindAllProductsRequest,
  ToggleProductRequest,
} from "@/http/products-http";
import { formatCurrencyFromCents } from "@/lib/formatters";
import {
  DotsThreeIcon,
  EyeIcon,
  PackageIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const {
    data: response,
    isPending,
    isFetching,
    isError,
    refetch,
  } = FindAllProductsRequest({ page, limit, search });
  const { mutate: toggleRequest, isPending: isToggling } =
    ToggleProductRequest();

  if (isPending) return <ListingPageSkeleton columns={7} rows={limit} />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load products.
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <PackageIcon size={24} />
          <h1 className="text-xl font-medium tracking-tight">Products</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          View products and their prices.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ListingSearch
          className="min-w-0 flex-[1_1_30rem]"
          value={searchInput}
          appliedValue={search}
          onValueChange={setSearchInput}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          label="Search products"
          inputLabel="Product details"
          placeholder="Search products..."
          status={
            isFetching
              ? "Updating products..."
              : search
                ? `${response.pagination.total} matching products`
                : ""
          }
        />
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
          <ProductFormDialog>
            <Button>
              <PlusIcon />
              New Product
            </Button>
          </ProductFormDialog>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>External ID</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {response.data.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.description || "—"}</TableCell>
              <TableCell>{product.externalId}</TableCell>
              <TableCell>
                {formatCurrencyFromCents(
                  product.priceInCents,
                  product.currency,
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={product.enabled}
                  disabled={isToggling}
                  aria-label={`Enable product ${product.name}`}
                  onCheckedChange={(enabled) =>
                    toggleRequest({ id: product.id, enabled })
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Actions for ${product.name}`}
                    >
                      <DotsThreeIcon size={32} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <DropdownMenuItem asChild>
                      <Link to={`/products/${product.id}`}>
                        <EyeIcon size={32} />
                        Details
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {response.data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-muted-foreground"
              >
                {search
                  ? "No products match your search."
                  : "No products found."}
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
    </div>
  );
}
