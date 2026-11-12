import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { CustomerFormDialog } from "@/components/customer-form-dialog";
import { ListingPageSkeleton } from "@/components/listing-page-skeleton";
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
  DeleteCustomerRequest,
  FindAllCustomersRequest,
} from "@/http/customers-http";
import {
  DotsThreeIcon,
  EyeIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: response,
    isPending,
    isFetching,
    isError,
    refetch,
  } = FindAllCustomersRequest({ page, limit, search });
  const { mutate: deleteCustomer, isPending: isDeleting } =
    DeleteCustomerRequest();

  if (isPending) return <ListingPageSkeleton columns={7} rows={limit} />;

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
          <CustomerFormDialog>
            <Button>
              <PlusIcon />
              New Customer
            </Button>
          </CustomerFormDialog>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Document</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {response.data.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.document}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Actions for ${customer.name}`}
                    >
                      <DotsThreeIcon size={32} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <DropdownMenuItem asChild>
                      <Link to={`/customers/${customer.id}`}>
                        <EyeIcon size={32} />
                        Details
                      </Link>
                    </DropdownMenuItem>
                    <CustomerFormDialog customer={customer}>
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                      >
                        <PencilSimpleIcon size={32} />
                        Edit
                      </DropdownMenuItem>
                    </CustomerFormDialog>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={() =>
                        setPendingDelete({
                          id: customer.id,
                          name: customer.name,
                        })
                      }
                      disabled={isDeleting}
                    >
                      <TrashIcon size={32} />
                      Delete
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
      <DeleteConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete customer?"
        itemName={pendingDelete?.name ?? ""}
        isPending={isDeleting}
        onConfirm={() => {
          if (!pendingDelete || isDeleting) return;
          deleteCustomer(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(null);
              if (response.data.length === 1 && page > 1) setPage(page - 1);
            },
          });
        }}
      />
    </div>
  );
}
