import { Skeleton } from "@/components/ui/skeleton";

export function PaymentMetricsSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading payment metrics...</span>
      <div aria-hidden="true" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-3 rounded border bg-card p-5">
              <Skeleton className="h-4 w-36 max-w-full" />
              <Skeleton className="h-9 w-28 max-w-full" />
            </div>
          ))}
        </div>
        <div className="min-w-0 space-y-4 border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-64 w-full sm:h-80" />
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-6 w-20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
