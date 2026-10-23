import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NumericFormat } from "react-number-format";
import {
  CreatePaymentRequest,
  type CreatePaymentResponse,
  type PaymentCurrency,
  type PaymentMethod,
} from "@/http/payments-http";
import { PaymentCurrencyBadge } from "./payment-currency-badge";
import { PaymentMethodBadge } from "./payment-method-badge";
import { PaymentCreatedContent } from "./payment-created-content";
import { Textarea } from "./ui/textarea";
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

const PaymentCurrencyValues: PaymentCurrency[] = ["USD", "EUR", "BRL"];
const PaymentMethodValues: PaymentMethod[] = ["CARD", "PIX", "BANK_SLIP"];
const paymentFormSchema = z.object({
  amountInCents: z
    .number()
    .int("Amount must be an integer.")
    .positive("Amount must be greater than zero."),
  currency: z.enum(PaymentCurrencyValues),
  method: z.enum(PaymentMethodValues),
  apiKey: z.string().trim().min(1, "API key is required."),
  description: z
    .string()
    .trim()
    .max(255, "Description must be at most 255 characters long."),
  externalId: z
    .string()
    .trim()
    .max(255, "External ID must be at most 255 characters long."),
  idempotencyKey: z
    .string()
    .trim()
    .max(255, "Idempotency key must be at most 255 characters long."),
});
type PaymentFormData = z.infer<typeof paymentFormSchema>;

export function PaymentFormDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [createdPayment, setCreatedPayment] =
    useState<CreatePaymentResponse | null>(null);

  const { mutate: createPayment, isPending: isSubmitting } =
    CreatePaymentRequest();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amountInCents: 0,
      currency: "BRL",
      method: "PIX",
      apiKey: "",
      description: "",
      externalId: "",
      idempotencyKey: "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    if (nextOpen) {
      form.reset();
      setCreatedPayment(null);
    }
    setOpen(nextOpen);
  }

  function onSubmit(data: PaymentFormData) {
    if (isSubmitting) return;
    createPayment(
      {
        ...data,
        description: data.description || undefined,
        externalId: data.externalId || undefined,
        idempotencyKey: data.idempotencyKey || undefined,
      },
      { onSuccess: setCreatedPayment },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {createdPayment ? (
          <PaymentCreatedContent payment={createdPayment} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>New payment</DialogTitle>
              <DialogDescription>
                Fill in the form to create a new payment.
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
                            <SelectValue placeholder="Select a currency" />
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
                            <SelectValue placeholder="Select a payment method" />
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
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="mk_test_..."
                          autoComplete="off"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. One-time payment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="externalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External ID (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idempotencyKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idempotency key (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                    >
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
