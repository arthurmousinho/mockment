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
import { Label } from "@/components/ui/label";
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
    <footer className="flex w-full items-center justify-between">
      <span className="text-sm text-muted-foreground">
        Total of {total} records
      </span>
      <footer className="flex items-center space-x-4">
        {variant === "default" && (
          <Label>
            Page {page} of {totalPages} pages
          </Label>
        )}
        {variant === "default" && (
          <Select
            value={limit.toString()}
            onValueChange={(value) => props.onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-12 w-17.5">
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
        <div className="flex items-center space-x-2">
          {variant === "default" && (
            <Button
              variant="outline"
              onClick={() => props.onPageChange(1)}
              disabled={!hasPreviousPage}
            >
              <CaretDoubleLeftIcon size={20} />
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => props.onPageChange(page - 1)}
            disabled={!hasPreviousPage}
          >
            <CaretLeftIcon size={20} />
          </Button>
          <Button
            variant="outline"
            onClick={() => props.onPageChange(page + 1)}
            disabled={!hasNextPage}
          >
            <CaretRightIcon size={20} />
          </Button>
          {variant === "default" && (
            <Button
              variant="outline"
              onClick={() => props.onPageChange(totalPages)}
              disabled={!hasNextPage}
            >
              <CaretDoubleRightIcon size={20} />
            </Button>
          )}
        </div>
      </footer>
    </footer>
  );
}
