import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { GetCustomerDetailsRequest } from "@/http/customers-http";
import { formatDateTime } from "@/lib/formatters";
import { ArrowLeftIcon, UsersIcon } from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useParams } from "react-router-dom";

export function CustomerDetailsPage() {
  const { id = "" } = useParams();
  const {
    data: customer,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = GetCustomerDetailsRequest(id);

  if (isPending) return <div role="status">Loading...</div>;

  if (
    error instanceof HTTPError &&
    error.response.status === 404 &&
    !customer
  ) {
    return <Navigate to="/404" replace />;
  }

  if (isError && !customer) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load customer details.
        </p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!customer) return <Navigate to="/404" replace />;

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <UsersIcon size={24} className="shrink-0" />
          <h1 className="text-xl font-medium tracking-tight">
            Customer details
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review this customer and their contact information.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Last updated: {formatDateTime(customer.updatedAt)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/customers">
              <ArrowLeftIcon size={18} />
              Back to customers
            </Link>
          </Button>
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        </div>
      </div>

      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this customer. Showing the last received data. Use
          Reload to try again.
        </div>
      )}

      <Card aria-label="Customer details">
        <CardHeader>
          <h2 className="text-sm font-medium">Customer details</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
          <DetailRow label="Name">{customer.name}</DetailRow>
          <DetailRow label="Email">{customer.email}</DetailRow>
          <DetailRow label="Phone">{customer.phone}</DetailRow>
          <DetailRow label="Document">{customer.document}</DetailRow>
          <DetailRow label="Created at">
            {formatDateTime(customer.createdAt)}
          </DetailRow>
          <DetailRow label="Updated at">
            {formatDateTime(customer.updatedAt)}
          </DetailRow>
        </CardContent>
      </Card>

      <Card aria-label="References">
        <CardHeader>
          <h2 className="text-sm font-medium">References</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Customer ID" value={customer.id} />
          <CopyableField label="External ID" value={customer.externalId} />
        </CardContent>
      </Card>
    </div>
  );
}
