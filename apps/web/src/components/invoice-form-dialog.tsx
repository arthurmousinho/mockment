import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreateInvoiceRequest } from "@/http/invoices-http";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const invoiceFormSchema = z.object({
  apiKey: z.string().trim().min(1, "API key is required."),
  paymentId: z.string().trim().min(1, "Payment ID is required.").max(191),
  customerName: z.string().trim().min(1, "Customer name is required.").max(191),
  customerTaxId: z.string().trim().max(191),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export function InvoiceFormDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { mutate: createInvoice, isPending } = CreateInvoiceRequest();
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      apiKey: "",
      paymentId: "",
      customerName: "",
      customerTaxId: "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    if (nextOpen) form.reset();
    setOpen(nextOpen);
  }

  function onSubmit(data: InvoiceFormData) {
    if (isPending) return;
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
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>
            Enter the payment and customer details for this invoice.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment ID</FormLabel>
                  <FormControl>
                    <Input placeholder="pay_..." {...field} />
                  </FormControl>
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
                      type="password"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
