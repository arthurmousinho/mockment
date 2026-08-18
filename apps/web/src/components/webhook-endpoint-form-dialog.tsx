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
import { Checkbox } from "@/components/ui/checkbox";
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
  CreateWebhookEndpointRequest,
  UpdateWebhookEndpointRequest,
} from "@/http/webhooks-http";
import { RevealedSecretDialog } from "@/components/revealed-secret-dialog";
import { EventTypeBadge } from "./event-type-badge";
import type { EventType } from "@/http/events-http";

const PAYMENT_EVENT_TYPES: EventType[] = [
  "PAYMENT_CREATED",
  "PAYMENT_PROCESSING",
  "PAYMENT_APPROVED",
  "PAYMENT_DECLINED",
  "PAYMENT_CANCELED",
] as const;

function buildSchema(isEditing: boolean) {
  return z.object({
    url: z
      .string({ message: "A URL deve ser um texto" })
      .trim()
      .url("Informe uma URL válida."),
    events: z
      .array(z.enum(PAYMENT_EVENT_TYPES))
      .min(1, "Selecione ao menos um evento."),
    apiKey: isEditing
      ? z.string().trim().optional()
      : z
          .string({ message: "A API key deve ser um texto" })
          .trim()
          .min(1, "Informe a API key."),
  });
}

type WebhookEndpointFormData = z.infer<ReturnType<typeof buildSchema>>;

type WebhookEndpointToEdit = {
  id: string;
  url: string;
  events: EventType[];
};

type WebhookEndpointFormDialogProps = {
  children: ReactNode;
  webhookEndpoint?: WebhookEndpointToEdit;
};

export function WebhookEndpointFormDialog({
  children,
  webhookEndpoint,
}: WebhookEndpointFormDialogProps) {
  const isEditing = Boolean(webhookEndpoint);

  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  const { mutate: createRequest, isPending: isCreating } =
    CreateWebhookEndpointRequest();
  const { mutate: updateRequest, isPending: isUpdating } =
    UpdateWebhookEndpointRequest();

  const isSubmitting = isCreating || isUpdating;

  const form = useForm<WebhookEndpointFormData>({
    resolver: zodResolver(buildSchema(isEditing)),
    defaultValues: {
      url: webhookEndpoint?.url ?? "",
      events: webhookEndpoint?.events ?? [],
      apiKey: "",
    },
  });

  function onSubmit(data: WebhookEndpointFormData) {
    if (isSubmitting) return;

    if (isEditing && webhookEndpoint) {
      updateRequest(
        { id: webhookEndpoint.id, url: data.url, events: data.events },
        {
          onSuccess: () => {
            handleOpenChange(false);
          },
        },
      );
      return;
    }

    createRequest(
      { url: data.url, events: data.events, apiKey: data.apiKey! },
      {
        onSuccess: (response) => {
          setSecret(response.secret);
        },
      },
    );
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        form.reset();
        setSecret(null);
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        {secret ? (
          <RevealedSecretDialog
            title="Webhook created"
            description="Copy the secret now. It will not be shown again."
            value={secret}
            onDone={() => handleOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Webhook" : "New Webhook"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the URL and events for this webhook endpoint."
                  : "Fill out the form below to create a new webhook endpoint."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/webhooks"
                          {...field}
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
                          <Input placeholder="sk_live_..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="events"
                  render={() => (
                    <FormItem>
                      <FormLabel>Events</FormLabel>
                      <div className="space-y-2">
                        {PAYMENT_EVENT_TYPES.map((type, index) => (
                          <FormField
                            key={index}
                            control={form.control}
                            name="events"
                            render={({ field }) => {
                              const checked = field.value?.includes(type);
                              return (
                                <FormItem className="flex flex-row items-center gap-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(isChecked) => {
                                        if (isChecked) {
                                          field.onChange([
                                            ...field.value,
                                            type,
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value.filter(
                                              (value) => value !== type,
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <EventTypeBadge type={type} />
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
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
