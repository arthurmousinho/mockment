import {
  CaretLeftIcon,
  CaretDoubleLeftIcon,
  CaretRightIcon,
  CaretDoubleRightIcon,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { PaginatedAPIResponse } from "@/types/http.type";

type PaginatorProps = {
  pagination: PaginatedAPIResponse<unknown>["pagination"];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  variant?: "default" | "minimal";
};

export function Paginator({ variant = "default", ...props }: PaginatorProps) {
  const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } =
    props.pagination;

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">
        Total of {total} records
      </span>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {variant === "default" && (
          <span className="text-sm">
            Page {page} of {totalPages} pages
          </span>
        )}
        {variant === "default" && (
          <Select
            value={limit.toString()}
            onValueChange={(value) => props.onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-17.5" aria-label="Records per page">
              <SelectValue placeholder="Records per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center gap-2">
          {variant === "default" && (
            <Button
              variant="outline"
              size="icon"
              aria-label="First page"
              onClick={() => props.onPageChange(1)}
              disabled={!hasPreviousPage}
            >
              <CaretDoubleLeftIcon size={20} />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            onClick={() => props.onPageChange(page - 1)}
            disabled={!hasPreviousPage}
          >
            <CaretLeftIcon size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            onClick={() => props.onPageChange(page + 1)}
            disabled={!hasNextPage}
          >
            <CaretRightIcon size={20} />
          </Button>
          {variant === "default" && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Last page"
              onClick={() => props.onPageChange(totalPages)}
              disabled={!hasNextPage}
            >
              <CaretDoubleRightIcon size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
