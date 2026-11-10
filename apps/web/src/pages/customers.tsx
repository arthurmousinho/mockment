import { ListingPageSkeleton } from "@/components/listing-page-skeleton";
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
import { FindAllCustomersRequest } from "@/http/customers-http";
import { formatDateTime } from "@/lib/formatters";
import { PlusIcon, UsersIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function CustomersPage() {
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
  } = FindAllCustomersRequest({ page, limit, search });

  if (isPending) return <ListingPageSkeleton columns={6} rows={limit} />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load customers.
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <UsersIcon size={24} />
          <h1 className="text-xl font-medium tracking-tight">Customers</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          View customers and their contact information.
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
          label="Search customers"
          inputLabel="Customer details"
          placeholder="Search customers..."
          status={
            isFetching
              ? "Updating customers..."
              : search
                ? `${response.pagination.total} matching customers`
                : ""
          }
        />
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
          <Button>
            <PlusIcon />
            New Customer
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>External ID</TableHead>
            <TableHead className="text-right">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {response.data.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.document}</TableCell>
              <TableCell>{customer.externalId}</TableCell>
              <TableCell className="text-right">
                {formatDateTime(customer.createdAt)}
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
                  ? "No customers match your search."
                  : "No customers found."}
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
