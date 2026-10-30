import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { RefetchButton } from "@/components/refetch-button";
import { ApiKeyFormDialog } from "@/components/api-key-form-dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/formatters";
import {
  DeleteApiKeyRequest,
  FindAllApiKeysRequest,
  RevokeApiKeyRequest,
  RotateApiKeyRequest,
} from "@/http/api-keys-http";
import {
  ArrowClockwiseIcon,
  ProhibitIcon,
  DotsThreeIcon,
  KeyIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { RevealedSecretDialog } from "@/components/revealed-secret-dialog";
import { Paginator } from "@/components/paginator";
import { ListingSearch } from "@/components/listing-search";

export function ApiKeysPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rotatedKey, setRotatedKey] = useState<string | null>(null);

  const {
    data: response,
    isPending,
    isFetching,
    isError,
    refetch,
  } = FindAllApiKeysRequest({ page, limit, search });
  const { mutate: deleteRequest, isPending: isDeleting } =
    DeleteApiKeyRequest();
  const { mutate: revokeRequest, isPending: isRevoking } =
    RevokeApiKeyRequest();
  const { mutate: rotateRequest, isPending: isRotating } =
    RotateApiKeyRequest();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">
          Failed to load API keys.
        </p>

        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  function handleDelete() {
    if (isDeleting || !pendingDelete) return;
    deleteRequest(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  }

  function handleRevoke(id: string) {
    if (isRevoking) return;
    revokeRequest(id);
  }

  function handleRotate(id: string) {
    if (isRotating) return;
    rotateRequest(id, {
      onSuccess: (response) => {
        setRotatedKey(response.rawKey);
      },
    });
  }

  return (
    <div className="min-w-0 space-y-4">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <KeyIcon size={24} className="font-medium" />
            <h1 className="text-xl font-medium tracking-tight">API Keys</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            API keys are used to authenticate your application when interacting
            with the payment gateways. They allow you to securely create
            payments, query transactions, trigger webhooks, and test payment
            flows just like you would with a real payment provider.
          </p>
        </div>
      </header>

      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ListingSearch
          className="min-w-0 flex-[1_1_30rem]"
          value={searchInput}
          appliedValue={search}
          onValueChange={setSearchInput}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          label="Search API keys"
          inputLabel="API key ID or name"
          placeholder="Search by ID or name..."
          status={
            isFetching
              ? "Updating API keys..."
              : search
                ? `${response.pagination.total} matching API keys`
                : ""
          }
        />
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <RefetchButton isFetching={isFetching} onRefetch={() => refetch()} />
          <ApiKeyFormDialog>
            <Button>
              <PlusIcon size={18} />
              New API Key
            </Button>
          </ApiKeyFormDialog>
        </div>
      </header>

      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Created At</TableHead>
            <TableHead className="text-right">Updated At</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {response?.data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="max-w-64 whitespace-normal wrap-break-wor">
                {item.name}
              </TableCell>
              <TableCell className="text-right">
                {formatDateTime(item.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                {formatDateTime(item.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={item.revokedAt ? "destructive" : "default"}>
                  {item.revokedAt ? "Revoked" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <DotsThreeIcon size={32} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <DropdownMenuItem
                      onClick={() => handleRotate(item.id)}
                      disabled={Boolean(item.revokedAt) || isRotating}
                    >
                      <ArrowClockwiseIcon size={32} />
                      Rotate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRevoke(item.id)}
                      disabled={Boolean(item.revokedAt) || isRevoking}
                    >
                      <ProhibitIcon size={32} />
                      Revoke
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={() =>
                        setPendingDelete({ id: item.id, name: item.name })
                      }
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

          {response?.data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-muted-foreground"
              >
                {search
                  ? "No API keys match your search."
                  : "No API keys found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="border-t px-2 py-3">
        <Paginator
          pagination={response.pagination}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
        />
      </div>

      <DeleteConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete API key?"
        itemName={pendingDelete?.name ?? ""}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />

      <Dialog
        open={Boolean(rotatedKey)}
        onOpenChange={(open) => !open && setRotatedKey(null)}
      >
        <DialogContent className="sm:max-w-sm">
          {rotatedKey && (
            <RevealedSecretDialog
              title="API key rotated"
              description="Copy your new key now. For security, it will not be shown again."
              value={rotatedKey}
              onDone={() => setRotatedKey(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
