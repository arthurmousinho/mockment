import { useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
import { z } from "zod";
import {
  CreateCheckoutRequest,
  type CheckoutListItem,
} from "@/http/checkout-http";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { CustomerPicker } from "./customer-picker";
import { SubscriptionPicker } from "./subscription-picker";
import { CheckoutStatusBadge } from "./checkout-status-badge";
import { PaymentMethodBadge } from "./payment-method-badge";
import { PaymentCurrencyBadge } from "./payment-currency-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { CopyableField } from "./ui/copyable-field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const methods = ["CARD", "PIX", "BANK_SLIP"] as const;
const formSchema = z
  .object({
    type: z.enum(["standalone", "subscription"]),
    apiKey: z.string().trim().min(1, "API key is required."),
    amountInCents: z.number().int().min(0).max(2147483647),
    currency: z.enum(["BRL", "USD", "EUR"]),
    allowedMethods: z.array(z.enum(methods)),
    customerId: z.string().trim().max(191),
    subscriptionId: z.string().trim().max(191),
    successUrl: z.union([z.url().max(191), z.literal("")]),
    cancelUrl: z.union([z.url().max(191), z.literal("")]),
    expiresAt: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "standalone") {
      if (data.amountInCents <= 0)
        ctx.addIssue({
          code: "custom",
          path: ["amountInCents"],
          message: "Amount must be greater than zero.",
        });
      if (data.allowedMethods.length === 0)
        ctx.addIssue({
          code: "custom",
          path: ["allowedMethods"],
          message: "Select at least one payment method.",
        });
    } else if (!data.subscriptionId) {
      ctx.addIssue({
        code: "custom",
        path: ["subscriptionId"],
        message: "Subscription ID is required.",
      });
    }
    if (
      data.expiresAt &&
      (!Number.isFinite(new Date(data.expiresAt).getTime()) ||
        new Date(data.expiresAt).getTime() <= Date.now())
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiration must be a future date.",
      });
    }
  });
type FormData = z.infer<typeof formSchema>;

export function CheckoutFormDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState("");
  const [created, setCreated] = useState<CheckoutListItem | null>(null);

  const { mutate: createCheckout, isPending } = CreateCheckoutRequest();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "standalone",
      apiKey: "",
      amountInCents: 0,
      currency: "BRL",
      allowedMethods: ["PIX"],
      customerId: "",
      subscriptionId: "",
      successUrl: "",
      cancelUrl: "",
      expiresAt: "",
    },
  });
  const type = useWatch({ control: form.control, name: "type" });

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    setOpen(nextOpen);
    if (nextOpen) {
      setCreated(null);
      setOptionalOpen("");
      form.reset();
    }
  }

  function onSubmit(data: FormData) {
    const options = {
      ...(data.successUrl && { successUrl: data.successUrl }),
      ...(data.cancelUrl && { cancelUrl: data.cancelUrl }),
      ...(data.expiresAt && {
        expiresAt: new Date(data.expiresAt).toISOString(),
      }),
    };
    if (data.type === "subscription") {
      createCheckout(
        {
          apiKey: data.apiKey,
          subscriptionId: data.subscriptionId,
          ...options,
        },
        { onSuccess: setCreated },
      );
    } else {
      createCheckout(
        {
          apiKey: data.apiKey,
          amountInCents: data.amountInCents,
          currency: data.currency,
          allowedMethods: data.allowedMethods,
          ...(data.customerId && { customerId: data.customerId }),
          ...options,
        },
        { onSuccess: setCreated },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Checkout created</DialogTitle>
              <DialogDescription>
                The checkout is ready to share.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-2xl font-semibold">
                  {formatCurrencyFromCents(
                    created.amountInCents,
                    created.currency,
                  )}
                </span>
                <CheckoutStatusBadge status={created.status} />
              </div>
              <CopyableField label="Checkout ID" value={created.id} />
              <CopyableField label="Checkout link" value={created.link} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Done
                </Button>
              </DialogClose>
              <Button asChild>
                <a
                  href={created.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Session
                </a>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>New checkout</DialogTitle>
              <DialogDescription>
                Create a standalone checkout or use a pending subscription.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  if (
                    errors.customerId ||
                    errors.successUrl ||
                    errors.cancelUrl ||
                    errors.expiresAt
                  ) {
                    setOptionalOpen("optional-fields");
                  }
                })}
                className="space-y-4"
              >
                <Tabs
                  value={type}
                  onValueChange={(value) =>
                    form.setValue("type", value as FormData["type"])
                  }
                >
                  <TabsList
                    className="grid w-full grid-cols-2"
                    aria-label="Checkout type"
                  >
                    <TabsTrigger value="standalone">Standalone</TabsTrigger>
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  </TabsList>
                  <TabsContent value="standalone" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
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
                                onValueChange={({ floatValue }) =>
                                  field.onChange(
                                    Math.round((floatValue ?? 0) * 100),
                                  )
                                }
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
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(["BRL", "USD", "EUR"] as const).map(
                                  (currency) => (
                                    <SelectItem key={currency} value={currency}>
                                      <PaymentCurrencyBadge
                                        currency={currency}
                                      />
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="allowedMethods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed payment methods</FormLabel>
                          <div className="flex flex-wrap gap-4">
                            {methods.map((method) => (
                              <label
                                key={method}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Checkbox
                                  checked={field.value.includes(method)}
                                  onCheckedChange={(checked) =>
                                    field.onChange(
                                      checked === true
                                        ? [...field.value, method]
                                        : field.value.filter(
                                            (item) => item !== method,
                                          ),
                                    )
                                  }
                                />
                                <PaymentMethodBadge method={method} />
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="subscription">
                    <FormField
                      control={form.control}
                      name="subscriptionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subscription</FormLabel>
                          <FormControl>
                            <SubscriptionPicker {...field} pendingOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="off"
                          placeholder="mk_test_..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Accordion
                  type="single"
                  collapsible
                  className="border px-2"
                  value={optionalOpen}
                  onValueChange={setOptionalOpen}
                >
                  <AccordionItem value="optional-fields">
                    <AccordionTrigger className="text-xs font-medium">
                      Optional details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {type === "standalone" && (
                          <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <FormControl>
                                  <CustomerPicker {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={form.control}
                          name="successUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Success URL</FormLabel>
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://example.com/success"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cancelUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cancel URL</FormLabel>
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://example.com/cancel"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="expiresAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expires at</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isPending}>
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
