import { Skeleton } from "@/components/ui/skeleton";

type DetailPageSkeletonProps = {
  label: string;
  sections?: number;
};

export function DetailPageSkeleton({
  label,
  sections = 3,
}: DetailPageSkeletonProps) {
  return (
    <div role="status" aria-busy="true" className="min-w-0 space-y-4">
      <span className="sr-only">Loading {label}...</span>
      <div className="space-y-2">
        <Skeleton className="h-7 w-56 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      {Array.from({ length: sections }, (_, section) => (
        <div key={section} className="space-y-6 rounded-xl border p-6">
          <Skeleton className="h-4 w-32" />
          <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
            {Array.from({ length: section === 0 ? 6 : 2 }, (_, row) => (
              <div key={row} className="flex justify-between gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36 max-w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
