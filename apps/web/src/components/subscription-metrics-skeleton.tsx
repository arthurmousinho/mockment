import { Skeleton } from "@/components/ui/skeleton";

export function SubscriptionMetricsSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading subscription metrics...</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:col-span-3">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="space-y-3 rounded border bg-card p-5">
              <Skeleton className="h-4 w-36 max-w-full" />
              <Skeleton className="h-9 w-28 max-w-full" />
            </div>
          ))}
        </div>
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className={`space-y-3 rounded border bg-card p-5 ${index === 0 ? "xl:col-start-4 xl:row-start-1" : "xl:col-start-4 xl:row-start-2"}`}
          >
            <Skeleton className="h-4 w-36 max-w-full" />
            <Skeleton className="h-9 w-28 max-w-full" />
          </div>
        ))}
        <div className="space-y-4 rounded border bg-card p-5 xl:col-span-3 xl:row-span-2 xl:row-start-2">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
        {Array.from({ length: 1 }, (_, index) => (
          <div
            key={index}
            className="space-y-3 rounded border bg-card p-5 xl:col-start-4 xl:row-start-3"
          >
            <Skeleton className="h-4 w-36 max-w-full" />
            <Skeleton className="h-9 w-28 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
