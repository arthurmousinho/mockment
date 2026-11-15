import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreateProductRequest,
  UpdateProductRequest,
  type Product,
} from "@/http/products-http";
import { PaymentCurrencyBadge } from "@/components/payment-currency-badge";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const productSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(255),
  description: z.string().trim().max(255),
  externalId: z.string().trim().min(1, "Enter an external ID.").max(255),
  priceInCents: z.number().int().min(0).max(2147483647),
  currency: z.enum(["BRL", "USD", "EUR"]),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductFormDialog({
  children,
  product,
}: {
  children: ReactNode;
  product?: Product;
}) {
  const [open, setOpen] = useState(false);
  const { mutate: createRequest, isPending: isCreating } =
    CreateProductRequest();
  const { mutate: updateRequest, isPending: isUpdating } =
    UpdateProductRequest();
  const isPending = isCreating || isUpdating;
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      externalId: product?.externalId ?? "",
      priceInCents: product?.priceInCents ?? 0,
      currency: product?.currency ?? "BRL",
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    if (nextOpen)
      form.reset({
        name: product?.name ?? "",
        description: product?.description ?? "",
        externalId: product?.externalId ?? "",
        priceInCents: product?.priceInCents ?? 0,
        currency: product?.currency ?? "BRL",
      });
    setOpen(nextOpen);
  }

  function onSubmit(data: ProductFormData) {
    if (isPending) return;
    const { description, ...values } = data;
    if (product) {
      updateRequest(
        { id: product.id, ...values, description: description || null },
        { onSuccess: () => setOpen(false) },
      );
      return;
    }
    createRequest(
      { ...values, ...(description && { description }) },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product details below."
              : "Fill out the form below to create a product."}
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
                    <Input placeholder="Product name" {...field} />
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
                    <Textarea placeholder="Product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="priceInCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        value={field.value / 100}
                        onBlur={field.onBlur}
                        getInputRef={field.ref}
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BRL">
                          <PaymentCurrencyBadge currency="BRL" />
                        </SelectItem>
                        <SelectItem value="USD">
                          <PaymentCurrencyBadge currency="USD" />
                        </SelectItem>
                        <SelectItem value="EUR">
                          <PaymentCurrencyBadge currency="EUR" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="externalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. product_123" {...field} />
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
