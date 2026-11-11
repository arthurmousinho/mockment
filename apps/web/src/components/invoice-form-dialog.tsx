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
import { PaymentPicker } from "@/components/payment-picker";
import {
  Form,
  FormControl,
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
    customerName: z
      .string()
      .trim()
      .min(1, "Customer name is required.")
      .max(191),
    customerTaxId: z.string().trim().max(191),
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

  const { mutate: createInvoice, isPending: isCreating } =
    CreateInvoiceRequest();

  const { mutate: updateInvoice, isPending: isUpdating } =
    UpdateInvoiceRequest();

  const isPending = isCreating || isUpdating;

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(buildSchema(isEditing)),
    defaultValues: {
      apiKey: "",
      paymentId: invoice?.paymentId ?? "",
      customerName: invoice?.customerName ?? "",
      customerTaxId: invoice?.customerTaxId ?? "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    if (nextOpen)
      form.reset({
        apiKey: "",
        paymentId: invoice?.paymentId ?? "",
        customerName: invoice?.customerName ?? "",
        customerTaxId: invoice?.customerTaxId ?? "",
      });
    setOpen(nextOpen);
  }

  function onSubmit(data: InvoiceFormData) {
    if (isPending) return;
    if (invoice) {
      updateInvoice(
        {
          id: invoice.id,
          customerName: data.customerName,
          customerTaxId: data.customerTaxId || null,
        },
        { onSuccess: () => setOpen(false) },
      );
      return;
    }
    createInvoice(
      { ...data, customerTaxId: data.customerTaxId || undefined },
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
              ? "Update the customer details for this invoice."
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
                    <PaymentPicker {...field} disabled={isEditing} />
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
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerTaxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer tax ID (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Tax ID" {...field} />
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
              <Button type="submit" disabled={isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
