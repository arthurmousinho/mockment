import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

type RevealedSecretDialogProps = {
  title: string;
  description: string;
  value: string;
  doneLabel?: string;
  onDone: () => void;
};

export function RevealedSecretDialog({
  title,
  description,
  value,
  doneLabel = "Done",
  onDone,
}: RevealedSecretDialogProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-2">
        <Input readOnly value={value} className="font-mono text-sm" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => copy(value)}
        >
          {copied ? (
            <CheckIcon size={16} className="text-green-600" />
          ) : (
            <CopyIcon size={16} />
          )}
        </Button>
      </div>
      <DialogFooter>
        <Button type="button" onClick={onDone}>
          {doneLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
