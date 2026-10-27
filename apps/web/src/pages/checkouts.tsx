import { useState } from "react";
import { ArrowSquareOutIcon, LinkSimpleIcon } from "@phosphor-icons/react";
import { ListingSearch } from "@/components/listing-search";
import { Paginator } from "@/components/paginator";
import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FindAllCheckoutsRequest } from "@/http/checkout-http";
import { formatDateTime } from "@/lib/formatters";

export function CheckoutsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data, isPending, isFetching, isError, refetch } =
    FindAllCheckoutsRequest({ page, limit, search });

  if (isPending) return <div>Loading checkouts...</div>;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">Failed to load checkouts.</p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <LinkSimpleIcon size={24} className="font-medium" />
          <h1 className="text-xl font-medium tracking-tight">Checkouts</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Find and open generated checkout links, or search by checkout,
          payment, subscription, or API key ID.
        </p>
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
          label="Search checkouts"
          inputLabel="Checkout, payment, subscription, or API key ID"
          placeholder="Search checkout or related IDs..."
        />
        <div className="flex items-center gap-2 lg:ml-auto">
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        </div>
      </header>

      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead>Checkout ID</TableHead>
            <TableHead>Payment ID</TableHead>
            <TableHead>Subscription ID</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Checkout Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {search
                  ? "No checkouts match your search."
                  : "No checkouts found."}
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((checkout) => (
              <TableRow key={checkout.id}>
                <TableCell className="font-mono">{checkout.id}</TableCell>
                <TableCell className="font-mono">{checkout.paymentId}</TableCell>
                <TableCell className="font-mono">
                  {checkout.subscriptionId ?? "—"}
                </TableCell>
                <TableCell>{formatDateTime(checkout.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <a href={checkout.link} target="_blank" rel="noreferrer">
                      <ArrowSquareOutIcon size={16} />
                      Open checkout
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Paginator
        pagination={data.pagination}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
