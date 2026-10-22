import { SubscriptionDetailsContent } from "./subscription-details-content";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, type ReactNode } from "react";
import {
  type Subscription,
  type CreateSubscriptionResponse,
  type SubscriptionInterval,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from "@/http/subscription-http";
import type { PaymentCurrency, PaymentMethod } from "@/http/payments-http";
import { PaymentCurrencyBadge } from "./payment-currency-badge";
import { PaymentMethodBadge } from "./payment-method-badge";
import { SubscriptionIntervalBadge } from "./subscription-interval-badge";
import { Textarea } from "./ui/textarea";
import { NumericFormat } from "react-number-format";

const PaymentCurrencyValues: PaymentCurrency[] = ["USD", "EUR", "BRL"];
const PaymentMethodValues: PaymentMethod[] = ["CARD", "PIX", "BANK_SLIP"];
const SubscriptionIntervalValues: SubscriptionInterval[] = [
  "DAY",
  "WEEK",
  "MONTH",
  "YEAR",
];

function buildSchema(isEditing: boolean) {
  return z.object({
    amountInCents: z
      .number({ message: "Amount must be a number." })
      .int({ message: "Amount must be an integer." })
      .positive({ message: "Amount must be greater than zero." }),
    currency: z.enum(PaymentCurrencyValues, { message: "Invalid currency." }),
    method: z.enum(PaymentMethodValues, { message: "Invalid payment method." }),
    description: z
      .string({ message: "Description must be a string." })
      .trim()
      .max(255, { message: "Description must be at most 255 characters long." })
      .optional(),
    interval: z.enum(SubscriptionIntervalValues, {
      message: "Invalid billing interval.",
    }),
    apiKey: isEditing
      ? z.string().optional()
      : z
          .string({ message: "API key must be a string." })
          .trim()
          .min(1, { message: "API key is required." }),
  });
}

type SubscriptionFormData = z.infer<ReturnType<typeof buildSchema>>;

type SubscriptionFormDialogProps = {
  children: ReactNode;
  subscription?: Subscription;
};

export function SubscriptionFormDialog({
  children,
  subscription,
}: SubscriptionFormDialogProps) {
  const isEditing = Boolean(subscription);

  const [open, setOpen] = useState(false);
  const [createdSubscription, setCreatedSubscription] =
    useState<CreateSubscriptionResponse | null>(null);

  const { mutate: createRequest, isPending: isCreating } =
    CreateSubscriptionRequest();
  const { mutate: updateRequest, isPending: isUpdating } =
    UpdateSubscriptionRequest();

  const isSubmitting = isCreating || isUpdating;

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(buildSchema(isEditing)),
    defaultValues: {
      amountInCents: subscription?.amountInCents ?? 0,
      currency: subscription?.currency ?? "BRL",
      method: subscription?.method ?? "PIX",
      description: subscription?.description ?? "",
      interval: subscription?.interval ?? "MONTH",
      apiKey: "",
    },
  });

  function onSubmit(data: SubscriptionFormData) {
    if (isSubmitting) return;

    if (isEditing && subscription) {
      updateRequest(
        { id: subscription.id, ...data },
        { onSuccess: () => handleOpenChange(false) },
      );
      return;
    }

    createRequest(
      { ...data, apiKey: data.apiKey ?? "" },
      { onSuccess: (response) => setCreatedSubscription(response) },
    );
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setCreatedSubscription(null);
    if (!nextOpen) {
      setTimeout(() => form.reset(), 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {createdSubscription ? (
          <SubscriptionDetailsContent
            subscription={createdSubscription}
            created
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit subscription" : "New subscription"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the subscription details."
                  : "Fill in the form to create a new subscription."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="amountInCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                          allowNegative={false}
                          value={field.value / 100}
                          onValueChange={({ floatValue }) => {
                            field.onChange(Math.round((floatValue ?? 0) * 100));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione uma moeda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PaymentCurrencyValues.map((currency, index) => (
                            <SelectItem key={index} value={currency}>
                              <PaymentCurrencyBadge currency={currency} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PaymentMethodValues.map((method, index) => (
                            <SelectItem key={index} value={method}>
                              <PaymentMethodBadge method={method} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Interval</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um intervalo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SubscriptionIntervalValues.map((interval, index) => (
                            <SelectItem key={index} value={interval}>
                              <SubscriptionIntervalBadge interval={interval} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isEditing && (
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="sk_live_..."
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: premium subscription"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
