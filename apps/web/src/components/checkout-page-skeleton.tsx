import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto max-w-7xl space-y-6 pt-6"
    >
      <span className="sr-only">Loading checkout...</span>
      <Skeleton className="h-9 w-full" />
      <div className="flex gap-4">
        <div className="grid flex-1 gap-8 rounded-xl border p-8 md:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="hidden w-1/5 space-y-4 rounded-xl border p-6 sm:block">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="space-y-4 rounded-xl border p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
