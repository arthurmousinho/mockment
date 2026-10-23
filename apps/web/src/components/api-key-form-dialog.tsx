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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, type ReactNode } from "react";
import { CreateApiKeyRequest } from "@/http/api-keys-http";
import { RevealedSecretDialog } from "./revealed-secret-dialog";

const apiKeySchema = z.object({
  name: z
    .string({ message: "Name must be a string." })
    .trim()
    .min(3, "Name must be at least 3 characters long.")
    .max(100, "Name must be at most 100 characters long."),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

type ApiKeyFormDialogProps = {
  children: ReactNode;
};

export function ApiKeyFormDialog({ children }: ApiKeyFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);

  const { mutate: createRequest, isPending: isCreating } =
    CreateApiKeyRequest();

  const form = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "" },
  });

  function onSubmit(data: ApiKeyFormData) {
    if (isCreating) return;
    createRequest(data, {
      onSuccess: (response) => {
        setRawKey(response.rawKey);
      },
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        form.reset();
        setRawKey(null);
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        {rawKey ? (
          <RevealedSecretDialog
            title="API key created"
            description="Copy your key now. For security, it will not be shown again."
            value={rawKey}
            onDone={() => handleOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>New API Key</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new API key.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My first API key" {...field} />
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
                  <Button type="submit" disabled={isCreating}>
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
