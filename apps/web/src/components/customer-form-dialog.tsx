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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  type Customer,
} from "@/http/customers-http";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(255),
  email: z.email("Enter a valid email.").max(255),
  phone: z.string().trim().min(1, "Enter a phone number.").max(255),
  document: z.string().trim().min(1, "Enter a document.").max(255),
  externalId: z.string().trim().min(1, "Enter an external ID.").max(255),
});

type CustomerFormData = z.infer<typeof customerSchema>;

type CustomerFormDialogProps = {
  children?: ReactNode;
  customer?: Customer;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CustomerFormDialog({
  children,
  customer,
  open: controlledOpen,
  onOpenChange,
}: CustomerFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  function setOpen(nextOpen: boolean) {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }
  const { mutate: createRequest, isPending: isCreating } =
    CreateCustomerRequest();
  const { mutate: updateRequest, isPending: isUpdating } =
    UpdateCustomerRequest();
  const isPending = isCreating || isUpdating;
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      document: customer?.document ?? "",
      externalId: customer?.externalId ?? "",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    if (nextOpen) {
      form.reset({
        name: customer?.name ?? "",
        email: customer?.email ?? "",
        phone: customer?.phone ?? "",
        document: customer?.document ?? "",
        externalId: customer?.externalId ?? "",
      });
    }
    setOpen(nextOpen);
  }

  function onSubmit(data: CustomerFormData) {
    if (isPending) return;
    if (customer) {
      updateRequest(
        { id: customer.id, ...data },
        { onSuccess: () => setOpen(false) },
      );
      return;
    }
    createRequest(data, { onSuccess: () => setOpen(false) });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "New Customer"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Update the customer details below."
              : "Fill out the form below to create a customer."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 555 123 4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Tax ID" {...field} />
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
                  <FormLabel>External ID</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g. customer_123"
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
