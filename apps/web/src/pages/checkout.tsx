import { useParams } from "react-router-dom";
import { GetCheckoutDetailsRequest } from "@/http/checkout-http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FlaskIcon,
  LockKeyIcon,
  CreditCardIcon,
  QrCodeIcon,
  BarcodeIcon,
  SpinnerGapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { DetailRow } from "@/components/ui/detail-row";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Logo } from "@/components/logo";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { canChangePaymentStatus } from "@/lib/utils";
import {
  ApprovePaymentRequest,
  CancelPaymentRequest,
  DeclinePaymentRequest,
  ProcessPaymentRequest,
  type PaymentStatus,
} from "@/http/payments-http";
import { SubscriptionIntervalBadge } from "@/components/subscription-interval-badge";
import { SubscriptionStatusBadge } from "@/components/subscription-status-badge";

const paymentMethodTabs = [
  { label: "Card", icon: CreditCardIcon },
  { label: "Pix", icon: QrCodeIcon },
  { label: "Bank Slip", icon: BarcodeIcon },
] as const;

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError, refetch } = GetCheckoutDetailsRequest(id!);
  const { mutate: proccessRequest, isPending: isProcessing } =
    ProcessPaymentRequest();
  const { mutate: approveRequest, isPending: isApproving } =
    ApprovePaymentRequest();
  const { mutate: declineRequest, isPending: isDeclining } =
    DeclinePaymentRequest();
  const { mutate: cancelRequest, isPending: isCanceling } =
    CancelPaymentRequest();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          This checkout was not found.
        </p>
      </div>
    );
  }

  function handleChangeStatus(id: string, status: PaymentStatus) {
    const requests: Record<PaymentStatus, () => void> = {
      CREATED: () => {},
      PROCESSING: () => proccessRequest(id, { onSuccess: () => refetch() }),
      DECLINED: () => declineRequest(id, { onSuccess: () => refetch() }),
      APPROVED: () =>
        approveRequest(id, {
          onSuccess: () => {
            if (data?.successUrl) {
              window.location.href = data.successUrl;
              return;
            }
            refetch();
          },
        }),
      CANCELED: () =>
        cancelRequest(id, {
          onSuccess: () => {
            if (data?.cancelUrl) {
              window.location.href = data.cancelUrl;
              return;
            }
            refetch();
          },
        }),
    };

    requests[status]();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pt-6">
      <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
        <FlaskIcon size={14} weight="bold" />
        JUST MOCKING! — this checkout is a fake local simulation
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-stretch justify-between gap-4 w-full">
          <Card className="overflow-hidden p-0 bg-secondary/20 flex-1">
            <div className="grid md:grid-cols-2">
              <div className="flex flex-col justify-between gap-8 p-8">
                <div>
                  <Logo
                    href="https://github.com/arthurmousinho/mockment"
                    target="_blank"
                  />
                  <p className="mt-10 text-muted-foreground">
                    {data.payment.description}
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight">
                    {formatCurrencyFromCents(
                      data.payment.amountInCents,
                      data.payment.currency,
                    )}
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {formatCurrencyFromCents(
                        data.payment.amountInCents,
                        data.payment.currency,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span>
                      {formatCurrencyFromCents(0, data.payment.currency)}
                    </span>
                  </div>
                  <Separator className="bg-neutral-700" />
                  <div className="flex items-center justify-between font-medium text-primary">
                    <span>Total due</span>
                    <span>
                      {formatCurrencyFromCents(
                        data.payment.amountInCents,
                        data.payment.currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-5 p-8 w-full">
                <div className="flex gap-2 rounded-lg bg-muted p-1">
                  {paymentMethodTabs.map(({ label, icon: Icon }, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                        index === 0
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Card number
                    </label>
                    <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                      4242 4242 4242 4242
                      <CreditCardIcon size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Expiry
                      </label>
                      <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                        12 / 34
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        CVV
                      </label>
                      <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                        •••
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Cardholder name
                    </label>
                    <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                      Jane Doe
                    </div>
                  </div>
                </div>
                <Button size="lg" className="w-full gap-2" disabled>
                  <LockKeyIcon size={16} />
                  Pay{" "}
                  {formatCurrencyFromCents(
                    data.payment.amountInCents,
                    data.payment.currency,
                  )}
                </Button>
              </div>
            </div>
          </Card>
          <Card className="w-[20%] min-h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FlaskIcon size={16} className="text-muted-foreground" />
                <p className="text-sm font-medium">Simulation panel</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Use the buttons below to simulate this payment's status
                changing. No real action is performed.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 justify-between h-full">
              <Button
                size="lg"
                variant="secondary"
                className="uppercase text-blue-500 flex-1"
                disabled={
                  !canChangePaymentStatus(data.payment.status, "PROCESSING") ||
                  isProcessing
                }
                onClick={() =>
                  handleChangeStatus(data.payment.id, "PROCESSING")
                }
              >
                <SpinnerGapIcon size={16} />
                Process
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="uppercase text-primary flex-1"
                disabled={
                  !canChangePaymentStatus(data.payment.status, "APPROVED") ||
                  isApproving
                }
                onClick={() => handleChangeStatus(data.payment.id, "APPROVED")}
              >
                <CheckCircleIcon size={16} />
                Approve
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="uppercase text-destructive flex-1"
                disabled={
                  !canChangePaymentStatus(data.payment.status, "DECLINED") ||
                  isDeclining
                }
                onClick={() => handleChangeStatus(data.payment.id, "DECLINED")}
              >
                <XCircleIcon size={16} />
                Decline
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="uppercase text-destructive flex-1"
                disabled={
                  !canChangePaymentStatus(data.payment.status, "CANCELED") ||
                  isCanceling
                }
                onClick={() => handleChangeStatus(data.payment.id, "CANCELED")}
              >
                <ProhibitIcon />
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
        {data.subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-center">
              <div className="w-full space-y-2">
                <DetailRow label="Subscription ID">
                  {data.subscriptionId}
                </DetailRow>
                <DetailRow label="Description">
                  {data.subscription.description}
                </DetailRow>
                <DetailRow label="Interval">
                  <SubscriptionIntervalBadge
                    interval={data.subscription.interval}
                  />
                </DetailRow>
                <DetailRow label="Interval Count">
                  {data.subscription.intervalCount}
                </DetailRow>
              </div>
              <Separator orientation="vertical" className="mx-4" />
              <div className="w-full space-y-2">
                <DetailRow label="Status">
                  <SubscriptionStatusBadge status={data.subscription.status} />
                </DetailRow>
                <DetailRow label="Created At">
                  {formatDateTime(data.subscription.createdAt)}
                </DetailRow>
                <DetailRow label="Updated At">
                  {formatDateTime(data.subscription.updatedAt)}
                </DetailRow>
                <DetailRow label="Next Billing At">
                  {formatDateTime(data.subscription.nextBillingAt)}
                </DetailRow>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>More Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-center">
            <div className="w-full space-y-2">
              <DetailRow label="Checkout ID">{data.id}</DetailRow>
              <DetailRow label="Checkout Success URL">
                {data.successUrl}
              </DetailRow>
              <DetailRow label="Checkout Cancel URL">
                {data.cancelUrl}
              </DetailRow>
              <DetailRow label="Checkout Created At">
                {formatDateTime(data.createdAt)}
              </DetailRow>
            </div>
            <Separator orientation="vertical" className="mx-4" />
            <div className="w-full space-y-2">
              <DetailRow label="Payment ID">{data.payment.id}</DetailRow>
              <DetailRow label="Payment Status">
                <PaymentStatusBadge status={data.payment.status} />
              </DetailRow>
              <DetailRow label="Payment Method">
                <PaymentMethodBadge method={data.payment.method} />
              </DetailRow>
              <DetailRow label="Payment Created At">
                {formatDateTime(data.payment.createdAt)}
              </DetailRow>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
