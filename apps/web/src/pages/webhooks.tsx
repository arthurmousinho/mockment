import { EventTypeBadge } from "@/components/event-type-badge";
import { Paginator } from "@/components/paginator";
import { RevealedSecretDialog } from "@/components/revealed-secret-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WebhookDeliveriesSheet } from "@/components/webhook-deliveries-sheet";
import { WebhookEndpointDeliveriesSheet } from "@/components/webhook-endpoint-deliveries-sheet";
import { WebhookEndpointFormDialog } from "@/components/webhook-endpoint-form-dialog";
import {
  DeleteWebhookEndpointRequest,
  FindAllWebhookEndpointsRequest,
  RotateWebhookEndpointRequest,
} from "@/http/webhooks-http";
import { formatDateTime } from "@/lib/formatters";
import {
  PencilIcon,
  ArrowClockwiseIcon,
  DotsThreeIcon,
  WebhooksLogoIcon,
  PlusIcon,
  TrashIcon,
  CellTowerIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

export function WebhooksPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null);

  const {
    data: response,
    isPending,
    isError,
    refetch,
  } = FindAllWebhookEndpointsRequest({
    page,
    limit,
  });
  const { mutate: rotateRequest, isPending: isRotating } =
    RotateWebhookEndpointRequest();
  const { mutate: deleteRequest, isPending: isDeleting } =
    DeleteWebhookEndpointRequest();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load Webhooks.
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  function handleRotate(id: string) {
    if (isRotating) return;
    rotateRequest(id, {
      onSuccess: (response) => {
        setRotatedSecret(response.secret);
      },
    });
  }

  function handleDelete(id: string) {
    if (isDeleting) return;
    deleteRequest(id);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <WebhooksLogoIcon size={24} className="font-medium" />
            <h1 className="text-xl font-medium tracking-tight">WebHooks</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Webhooks allow payment gateways to send notifications to your
            application whenever an event occurs, such as successful or failed
            payments, refunds, chargebacks, or transaction status updates.
          </p>
        </div>

        <nav className="flex items-center gap-2">
          <WebhookDeliveriesSheet>
            <Button variant="secondary">
              <CellTowerIcon size={18} />
              View All Deliveries
            </Button>
          </WebhookDeliveriesSheet>
          <WebhookEndpointFormDialog>
            <Button>
              <PlusIcon size={18} />
              New Endpoint
            </Button>
          </WebhookEndpointFormDialog>
        </nav>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead className="text-right">URL</TableHead>
            <TableHead className="text-right">Created At</TableHead>
            <TableHead className="text-right">Updated At</TableHead>
            <TableHead className="text-right">Events</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {response.data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell className="text-right">{item.url}</TableCell>
              <TableCell className="text-right">
                {formatDateTime(item.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                {formatDateTime(item.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer">
                      {item.events?.length ?? 0} event
                      {(item.events?.length ?? 0) !== 1 ? "s" : ""}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64" side="left">
                    {item.events && item.events.length > 0 ? (
                      <ul className="flex flex-col gap-1">
                        {item.events.map((event) => (
                          <EventTypeBadge key={event} type={event} />
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No events configured.
                      </p>
                    )}
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <DotsThreeIcon size={32} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <WebhookEndpointDeliveriesSheet endpointId={item.id}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <CellTowerIcon size={32} />
                        Deliveries
                      </DropdownMenuItem>
                    </WebhookEndpointDeliveriesSheet>
                    <WebhookEndpointFormDialog webhookEndpoint={item}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <PencilIcon size={32} />
                        Edit
                      </DropdownMenuItem>
                    </WebhookEndpointFormDialog>
                    <DropdownMenuItem
                      onClick={() => handleRotate(item.id)}
                      disabled={isRotating}
                    >
                      <ArrowClockwiseIcon size={32} />
                      Rotate Secret
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                    >
                      <TrashIcon size={32} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {response.data?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-muted-foreground"
              >
                No Webhooks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter className="w-full bg-transparent">
          <TableRow>
            <TableCell colSpan={6} className="w-full py-2">
              <Paginator
                pagination={response.pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Dialog
        open={Boolean(rotatedSecret)}
        onOpenChange={(open) => !open && setRotatedSecret(null)}
      >
        <DialogContent className="sm:max-w-sm">
          {rotatedSecret && (
            <RevealedSecretDialog
              title="Webhook Endpoint Secret Rotate"
              description="Copy your new secret now. It will not be shown again for security reasons."
              value={rotatedSecret}
              onDone={() => setRotatedSecret(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
