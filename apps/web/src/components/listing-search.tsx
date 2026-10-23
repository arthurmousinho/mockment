import type { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ListingSearchProps = {
  value: string;
  appliedValue: string;
  onValueChange: (value: string) => void;
  onSearch: (value: string) => void;
  label?: string;
  inputLabel?: string;
  placeholder?: string;
  maxLength?: number;
  status?: ReactNode;
  className?: string;
};

export function ListingSearch({
  value,
  appliedValue,
  onValueChange,
  onSearch,
  label = "Search records",
  inputLabel = label,
  placeholder = "Search...",
  maxLength = 255,
  className,
}: ListingSearchProps) {
  return (
    <form
      role="search"
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-2", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value.trim());
      }}
    >
      <div className="relative min-w-0 flex-1 sm:max-w-md">
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground"
        />
        <Input
          type="search"
          aria-label={inputLabel}
          placeholder={placeholder}
          maxLength={maxLength}
          className="pl-9"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      </div>
      <Button type="submit">Search</Button>
      {(value || appliedValue) && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onValueChange("");
            onSearch("");
          }}
        >
          Clear
        </Button>
      )}
    </form>
  );
}
