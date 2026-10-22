import { useState, type ReactNode } from "react";
import { GetSubscriptionDetailsRequest } from "@/http/subscription-http";
import { SubscriptionDetailsContent } from "./subscription-details-content";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function SubscriptionDetailsDialog({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError, isFetching, refetch } =
    GetSubscriptionDetailsRequest(id, { enabled: open });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {data ? (
          <SubscriptionDetailsContent subscription={data} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Subscription details</DialogTitle>
              <DialogDescription>
                Full information about this subscription.
              </DialogDescription>
            </DialogHeader>
            {isPending && <p role="status">Loading subscription details...</p>}
            {isError && (
              <div className="space-y-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Failed to load subscription details.
                </p>
                <Button disabled={isFetching} onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
