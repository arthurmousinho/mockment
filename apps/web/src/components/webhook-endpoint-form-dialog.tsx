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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAYMENT_EVENT_TYPES: EventType[] = [
  "PAYMENT_CREATED",
  "PAYMENT_PROCESSING",
  "PAYMENT_APPROVED",
  "PAYMENT_DECLINED",
  "PAYMENT_CANCELED",
  "PAYMENT_REFUNDED",
] as const;

const SUBSCRIPTION_EVENT_TYPES: EventType[] = [
  "SUBSCRIPTION_CREATED",
  "SUBSCRIPTION_ACTIVATED",
  "SUBSCRIPTION_RENEWED",
  "SUBSCRIPTION_PAUSED",
  "SUBSCRIPTION_RESUMED",
  "SUBSCRIPTION_CANCELED",
];

const INVOICE_EVENT_TYPES: EventType[] = [
  "INVOICE_CREATED",
  "INVOICE_ISSUED",
  "INVOICE_REJECTED",
  "INVOICE_CANCELED",
];

const EVENT_GROUPS = [
  { label: "Payment Events", value: "payments", types: PAYMENT_EVENT_TYPES },
  {
    label: "Subscription Events",
    value: "subscriptions",
    types: SUBSCRIPTION_EVENT_TYPES,
  },
  { label: "Invoice Events", value: "invoices", types: INVOICE_EVENT_TYPES },
] as const;

const ALL_EVENT_TYPES = EVENT_GROUPS.flatMap((group) => group.types) as [
  EventType,
  ...EventType[],
];

function buildSchema(isEditing: boolean) {
  return z.object({
    url: z.url("Enter a valid URL."),
    events: z
      .array(z.enum(ALL_EVENT_TYPES))
      .min(1, "Select at least one event."),
    apiKey: isEditing
      ? z.string().trim().optional()
      : z
          .string({ message: "API key must be a string." })
          .trim()
          .min(1, "Enter the API key."),
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
      <DialogContent className="sm:max-w-md">
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
                )}
                <FormField
                  control={form.control}
                  name="events"
                  render={() => (
                    <FormItem>
                      <FormLabel>Events</FormLabel>
                      <Accordion
                        type="single"
                        collapsible
                        className="border px-2"
                      >
                        {EVENT_GROUPS.map((group) => (
                          <AccordionItem key={group.value} value={group.value}>
                            <AccordionTrigger className="text-xs font-medium">
                              {group.label}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {group.types.map((type) => (
                                  <FormField
                                    key={type}
                                    control={form.control}
                                    name="events"
                                    render={({ field }) => {
                                      const checked =
                                        field.value?.includes(type);
                                      return (
                                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={checked}
                                              onCheckedChange={(isChecked) => {
                                                field.onChange(
                                                  isChecked
                                                    ? [...field.value, type]
                                                    : field.value.filter(
                                                        (value) =>
                                                          value !== type,
                                                      ),
                                                );
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
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
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
