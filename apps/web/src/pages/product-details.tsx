import { PaymentCurrencyBadge } from "@/components/payment-currency-badge";
import { RefetchButton } from "@/components/refetch-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyableField } from "@/components/ui/copyable-field";
import { DetailRow } from "@/components/ui/detail-row";
import { GetProductDetailsRequest } from "@/http/products-http";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { ArrowLeftIcon, PackageIcon } from "@phosphor-icons/react";
import { HTTPError } from "ky";
import { Link, Navigate, useParams } from "react-router-dom";

export function ProductDetailsPage() {
  const { id = "" } = useParams();
  const {
    data: product,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = GetProductDetailsRequest(id);

  if (isPending) return <div role="status">Loading...</div>;

  if (error instanceof HTTPError && error.response.status === 404 && !product) {
    return <Navigate to="/404" replace />;
  }

  if (isError && !product) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load product details.
        </p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!product) return <Navigate to="/404" replace />;

  return (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <PackageIcon size={24} className="shrink-0" />
          <h1 className="text-xl font-medium tracking-tight">
            Product details
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review this product and its price.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Last updated: {formatDateTime(product.updatedAt)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/products">
              <ArrowLeftIcon size={18} />
              Back to products
            </Link>
          </Button>
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
        </div>
      </div>
      {isError && (
        <div role="alert" className="text-sm text-destructive">
          Could not refresh this product. Showing the last received data. Use
          Reload to try again.
        </div>
      )}
      <Card aria-label="Product details">
        <CardHeader>
          <h2 className="text-sm font-medium">Product details</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div]:wrap-break-word">
          <DetailRow label="Name">{product.name}</DetailRow>
          <DetailRow label="Description">
            {product.description || "—"}
          </DetailRow>
          <DetailRow label="Price">
            {formatCurrencyFromCents(product.priceInCents, product.currency)}
          </DetailRow>
          <DetailRow label="Currency">
            <PaymentCurrencyBadge currency={product.currency} />
          </DetailRow>
          <DetailRow label="Status">
            {product.enabled ? "Enabled" : "Disabled"}
          </DetailRow>
          <DetailRow label="Created at">
            {formatDateTime(product.createdAt)}
          </DetailRow>
          <DetailRow label="Updated at">
            {formatDateTime(product.updatedAt)}
          </DetailRow>
        </CardContent>
      </Card>
      <Card aria-label="References">
        <CardHeader>
          <h2 className="text-sm font-medium">References</h2>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-x-8 gap-y-2.5 lg:grid-cols-2 [&>div]:min-w-0 [&>div]:flex-wrap [&>div>div]:min-w-0 [&>div>div>span]:break-all">
          <CopyableField label="Product ID" value={product.id} />
          <CopyableField label="External ID" value={product.externalId} />
        </CardContent>
      </Card>
    </div>
  );
}
