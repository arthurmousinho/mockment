import { Skeleton } from "@/components/ui/skeleton";

export function WebhookMetricsSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading webhook metrics...</span>
      <div aria-hidden="true" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-3 rounded border bg-card p-5">
              <Skeleton className="h-4 w-36 max-w-full" />
              <Skeleton className="h-9 w-28 max-w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-4 border bg-card p-5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-64 w-full sm:h-80" />
        </div>
      </div>
    </div>
  );
}
