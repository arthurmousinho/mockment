import { useState, type ReactNode } from "react";
import { GetCustomerDetailsRequest } from "@/http/customers-http";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/formatters";

export function CustomerDetailsDialog({ id, children }: { id: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: customer, isPending, isError, isFetching, refetch } =
    GetCustomerDetailsRequest(id, { enabled: open });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customer details</DialogTitle>
          <DialogDescription>Full information about this customer.</DialogDescription>
        </DialogHeader>
        {isPending && (
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        )}
        {isError && (
          <div className="space-y-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">Failed to load customer details.</p>
            <Button disabled={isFetching} onClick={() => refetch()}>Try again</Button>
          </div>
        )}
        {customer && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              <DetailRow label="Name">{customer.name}</DetailRow>
              <DetailRow label="Email">{customer.email}</DetailRow>
              <DetailRow label="Phone">{customer.phone}</DetailRow>
              <DetailRow label="Document">{customer.document}</DetailRow>
            </div>
            <Separator />
            <div className="space-y-2.5">
              <CopyableField label="Customer ID" value={customer.id} />
              <CopyableField label="External ID" value={customer.externalId} />
            </div>
            <Separator />
            <div className="space-y-2.5">
              <DetailRow label="Created at">{formatDateTime(customer.createdAt)}</DetailRow>
              <DetailRow label="Updated at">{formatDateTime(customer.updatedAt)}</DetailRow>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline">Done</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
