import { useState } from "react";
import { useParams } from "react-router-dom";
import { HTTPError } from "ky";
import {
  CompleteCheckoutRequest,
  GetCheckoutSessionRequest,
  CancelCheckoutRequest,
  type CheckoutOutcome,
} from "@/http/checkout-http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FlaskIcon,
  LockKeyIcon,
  CreditCardIcon,
  QrCodeIcon,
  BarcodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ProhibitIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { DetailRow } from "@/components/ui/detail-row";
import { CheckoutStatusBadge } from "@/components/checkout-status-badge";
import type { PaymentMethod } from "@/http/payments-http";
import { Logo } from "@/components/logo";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/formatters";
import { SubscriptionIntervalBadge } from "@/components/subscription-interval-badge";
import { SubscriptionStatusBadge } from "@/components/subscription-status-badge";
import { InvalidCheckout } from "@/components/invalid-checkout";
import { useVirtualClockEvents } from "@/hooks/use-virtual-clock-events";

const paymentMethodTabs = [
  { label: "Card", method: "CARD", icon: CreditCardIcon },
  { label: "Pix", method: "PIX", icon: QrCodeIcon },
  { label: "Bank Slip", method: "BANK_SLIP", icon: BarcodeIcon },
] as const;

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );

  const { data, isPending, isError, error, refetch } =
    GetCheckoutSessionRequest(id ?? "");
  const { mutate: completeReqeust, isPending: isCompleting } =
    CompleteCheckoutRequest(id ?? "");
  const { mutate: cancelRequest, isPending: isCanceling } =
    CancelCheckoutRequest();
  const { virtualDateTime, liveVirtualDateTime } = useVirtualClockEvents();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    if (
      error instanceof HTTPError &&
      (error.response.status === 404 || error.response.status === 422)
    ) {
      return <InvalidCheckout notFound={error.response.status === 404} />;
    }

    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Could not load this checkout.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const remainingSeconds =
    data.expiresAt && liveVirtualDateTime
      ? Math.max(
          0,
          Math.ceil(
            (new Date(data.expiresAt).getTime() -
              liveVirtualDateTime.getTime()) /
              1000,
          ),
        )
      : null;

  if (
    data.expiresAt &&
    virtualDateTime &&
    new Date(data.expiresAt).getTime() <= virtualDateTime.getTime()
  ) {
    return <InvalidCheckout notFound={false} />;
  }

  const days =
    remainingSeconds === null ? 0 : Math.floor(remainingSeconds / 86400);
  const hours =
    remainingSeconds === null
      ? 0
      : Math.floor((remainingSeconds % 86400) / 3600);
  const minutes =
    remainingSeconds === null ? 0 : Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds === null ? 0 : remainingSeconds % 60;
  const countdown = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  const method =
    selectedMethod && data.allowedMethods.includes(selectedMethod)
      ? selectedMethod
      : data.allowedMethods[0];

  function handleCompleteCheckout(outcome: CheckoutOutcome) {
    if (!data || !method) return;
    const redirectUrl =
      outcome === "APPROVED" ? data.successUrl : data.cancelUrl;
    completeReqeust(
      { method, outcome },
      {
        onSuccess: () => {
          window.location.href = redirectUrl;
        },
      },
    );
  }

  function handleCancelCheckout() {
    if (!data) return;
    const redirectUrl = data.cancelUrl;
    cancelRequest(data.id, {
      onSuccess: () => {
        window.location.href = redirectUrl;
      },
    });
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
                    {data.subscription?.description ?? "Checkout"}
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight">
                    {formatCurrencyFromCents(data.amountInCents, data.currency)}
                  </p>
                  {data.expiresAt && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <ClockIcon size={16} aria-hidden="true" />
                      {remainingSeconds === null
                        ? "Loading expiration time…"
                        : `Expires in ${days > 0 ? `${days}d ` : ""}${countdown}`}
                    </p>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  {data.items.length > 0 && (
                    <section className="space-y-3">
                      <ul className="max-h-32 space-y-3 overflow-y-auto">
                        {data.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="wrap-break-wor">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} ×{" "}
                                {formatCurrencyFromCents(
                                  item.unitAmountInCents,
                                  data.currency,
                                )}
                              </p>
                            </div>
                            <span className="shrink-0 tabular-nums">
                              {formatCurrencyFromCents(
                                item.unitAmountInCents * item.quantity,
                                data.currency,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Separator />
                    </section>
                  )}
                  <div className="flex items-center justify-between font-medium text-primary">
                    <span>Total due</span>
                    <span>
                      {formatCurrencyFromCents(
                        data.amountInCents,
                        data.currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-5 p-8 w-full">
                <div className="flex gap-2 rounded-lg bg-muted p-1">
                  {paymentMethodTabs
                    .filter(({ method }) =>
                      data.allowedMethods.includes(method),
                    )
                    .map(({ label, method, icon: Icon }) => (
                      <button
                        key={method}
                        type="button"
                        disabled={isCompleting || isCanceling}
                        onClick={() => setSelectedMethod(method)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                          selectedMethod === method ||
                          (!selectedMethod && data.allowedMethods[0] === method)
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                </div>
                {(selectedMethod ?? data.allowedMethods[0]) === "CARD" && (
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
                )}
                {method === "PIX" && (
                  <div className="space-y-3 text-center">
                    <p className="text-sm font-medium">Scan the Pix QR code</p>
                    <a
                      href="https://github.com/arthurmousinho/mockment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-auto block w-fit rounded-md bg-white p-4"
                      aria-label="Open the Mockment GitHub repository"
                    >
                      <img
                        src="/mockment-github-qr.png"
                        alt="QR code linking to the Mockment GitHub repository"
                        className="size-40"
                      />
                    </a>
                    <p className="text-xs text-muted-foreground">
                      This simulation QR code opens the Mockment GitHub
                      repository.
                    </p>
                  </div>
                )}
                {method === "BANK_SLIP" && (
                  <div className="space-y-3 rounded-md border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BarcodeIcon size={20} />
                      Bank slip
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sample payment line for this simulation:
                    </p>
                    <p className="break-all font-mono text-sm">
                      00000.00000 00000.000000 00000.000000 0 00000000000000
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This is a sample and cannot be used to make a payment.
                    </p>
                  </div>
                )}
                <Button size="lg" className="w-full gap-2" disabled>
                  <LockKeyIcon size={16} />
                  Pay{" "}
                  {formatCurrencyFromCents(data.amountInCents, data.currency)}
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
                Use the buttons below to simulate this checkout's completion.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 justify-between h-full">
              <Button
                size="lg"
                variant="secondary"
                className="uppercase text-primary flex-1"
                disabled={
                  isCompleting ||
                  isCanceling ||
                  data.allowedMethods.length === 0
                }
                onClick={() => handleCompleteCheckout("APPROVED")}
              >
                <CheckCircleIcon size={16} />
                Approve
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="uppercase text-destructive flex-1"
                disabled={
                  isCompleting ||
                  isCanceling ||
                  data.allowedMethods.length === 0
                }
                onClick={() => handleCompleteCheckout("DECLINED")}
              >
                <XCircleIcon size={16} />
                Decline
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="uppercase text-destructive flex-1"
                disabled={isCompleting || isCanceling}
                onClick={handleCancelCheckout}
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
                <DetailRow label="ID">{data.subscriptionId}</DetailRow>
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
              <DetailRow label="Status">
                <CheckoutStatusBadge status={data.status} />
              </DetailRow>
              <DetailRow label="Payment Method">
                {method ? <PaymentMethodBadge method={method} /> : "—"}
              </DetailRow>
              <DetailRow label="Expires At">
                {formatDateTime(data.expiresAt)}
              </DetailRow>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
