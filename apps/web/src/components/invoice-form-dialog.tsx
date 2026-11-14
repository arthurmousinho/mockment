import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  type Invoice,
} from "@/http/invoices-http";
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
import { CustomerPicker } from "@/components/customer-picker";
import { PaymentPicker } from "@/components/payment-picker";
import { GetPaymentDetailsRequest } from "@/http/payments-http";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function buildSchema(isEditing: boolean) {
  return z.object({
    apiKey: isEditing
      ? z.string()
      : z.string().trim().min(1, "API key is required."),
    paymentId: z.string().trim().min(1, "Payment ID is required.").max(191),
    customerId: z.string().trim().min(1, "Customer is required.").max(191),
  });
}

type InvoiceFormData = z.infer<ReturnType<typeof buildSchema>>;

export function InvoiceFormDialog({
  children,
  invoice,
}: {
  children: ReactNode;
  invoice?: Invoice;
}) {
  const isEditing = Boolean(invoice);
  const [open, setOpen] = useState(false);
  const [paymentCustomerId, setPaymentCustomerId] = useState<string | null>(
    null,
  );

  const { mutate: createInvoice, isPending: isCreating } =
    CreateInvoiceRequest();

  const { mutate: updateInvoice, isPending: isUpdating } =
    UpdateInvoiceRequest();

  const isPending = isCreating || isUpdating;
  const {
    data: editPayment,
    isError: isPaymentError,
    refetch: refetchPayment,
  } = GetPaymentDetailsRequest(invoice?.paymentId ?? "", {
    enabled: open && isEditing,
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(buildSchema(isEditing)),
    defaultValues: {
      apiKey: "",
      paymentId: invoice?.paymentId ?? "",
      customerId: invoice?.customerId ?? "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    if (nextOpen) {
      setPaymentCustomerId(null);
      form.reset({
        apiKey: "",
        paymentId: invoice?.paymentId ?? "",
        customerId: invoice?.customerId ?? "",
      });
    }
    setOpen(nextOpen);
  }

  function onSubmit(data: InvoiceFormData) {
    if (isPending) return;
    if (invoice) {
      updateInvoice(
        {
          id: invoice.id,
          customerId: editPayment?.customerId ?? data.customerId,
        },
        { onSuccess: () => setOpen(false) },
      );
      return;
    }
    createInvoice(
      {
        apiKey: data.apiKey,
        paymentId: data.paymentId,
        customerId: data.customerId,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit invoice" : "New invoice"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the customer for this invoice."
              : "Enter the payment and customer details for this invoice."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment</FormLabel>
                  <FormControl>
                    <PaymentPicker
                      {...field}
                      disabled={isEditing}
                      onPaymentSelect={(payment) => {
                        if (payment.customerId || paymentCustomerId) {
                          form.setValue(
                            "customerId",
                            payment.customerId ?? "",
                            { shouldValidate: true },
                          );
                        }
                        setPaymentCustomerId(payment.customerId);
                      }}
                    />
                  </FormControl>
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
                        placeholder="mk_test_..."
                        type="password"
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
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <CustomerPicker
                      {...field}
                      value={editPayment?.customerId ?? field.value}
                      disabled={
                        isEditing
                          ? !editPayment || Boolean(editPayment.customerId)
                          : Boolean(paymentCustomerId)
                      }
                    />
                  </FormControl>
                  {(paymentCustomerId ||
                    (isEditing && editPayment?.customerId)) && (
                    <FormDescription className="text-xs italic">
                      This customer is linked to the selected payment.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEditing && isPaymentError && !editPayment && (
              <div role="alert" className="text-sm text-destructive">
                Unable to load the payment.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => refetchPayment()}
                >
                  Try again
                </button>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending || (isEditing && !editPayment)}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
