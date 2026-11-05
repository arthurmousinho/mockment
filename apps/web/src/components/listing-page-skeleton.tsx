import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ListingPageSkeletonProps = {
  columns?: number;
  rows?: number;
};

export function ListingPageSkeleton({
  columns = 5,
  rows = 10,
}: ListingPageSkeletonProps) {
  return (
    <div role="status" className="min-w-0">
      <span className="sr-only">Loading records...</span>

      <div aria-hidden="true" className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 shrink-0" />
            <Skeleton className="h-7 w-48 max-w-full" />
          </div>
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-[1_1_30rem] items-center gap-2">
            <Skeleton className="h-8 min-w-0 flex-1 sm:max-w-md" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex items-center gap-2 lg:ml-auto">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/70">
            <TableRow>
              {Array.from({ length: columns }, (_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }, (_, columnIndex) => (
                  <TableCell key={columnIndex} className="h-12">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-2 py-3">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-18" />
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="size-8" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
