import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type RefetchButtonProps = {
  isFetching: boolean;
  onRefetch: () => void;
};

export function RefetchButton({ isFetching, onRefetch }: RefetchButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      aria-label="Refresh list"
      title="Refresh list"
      aria-busy={isFetching}
      disabled={isFetching}
      onClick={onRefetch}
    >
      <ArrowClockwiseIcon
        aria-hidden="true"
        className={
          isFetching ? "animate-spin motion-reduce:animate-none" : undefined
        }
      />
      Reload
    </Button>
  );
}
