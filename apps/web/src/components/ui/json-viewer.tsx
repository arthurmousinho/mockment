import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JsonViewerProps = {
  value: unknown;
  label?: string;
  className?: string;
  defaultExpandedDepth?: number;
};

type JsonValue =
  | null
  | string
  | number
  | boolean
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

function JsonNode({
  value,
  name,
  depth,
  expandedDepth,
}: {
  value: JsonValue;
  name?: string;
  depth: number;
  expandedDepth: number;
}) {
  const key =
    name === undefined ? null : (
      <span className="text-foreground">{JSON.stringify(name)}: </span>
    );

  if (value !== null && typeof value === "object") {
    const array = Array.isArray(value);
    const entries = Object.entries(value);
    const opening = array ? "[" : "{";
    const closing = array ? "]" : "}";
    if (entries.length === 0) {
      return (
        <div>
          {key}
          {opening}
          {closing}
        </div>
      );
    }
    return (
      <details open={depth < expandedDepth} className="group/json-node">
        <summary className="w-fit cursor-pointer select-none rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          {key}
          <span>{opening}</span>
          <span className="mx-2 text-muted-foreground">
            {entries.length} {array ? "items" : "keys"}
          </span>
          <span>{closing}</span>
        </summary>
        <div className="ml-1 border-l border-border pl-4">
          {entries.map(([entryName, entry]) => (
            <JsonNode
              key={entryName}
              name={array ? undefined : entryName}
              value={entry}
              depth={depth + 1}
              expandedDepth={expandedDepth}
            />
          ))}
        </div>
      </details>
    );
  }

  return (
    <div>
      {key}
      <span
        className={cn(
          typeof value === "string" && "text-primary",
          typeof value === "number" && "text-chart-2",
          typeof value === "boolean" && "text-chart-3",
          value === null && "italic text-muted-foreground",
        )}
      >
        {JSON.stringify(value)}
      </span>
    </div>
  );
}

export function JsonViewer({
  value,
  label = "JSON",
  className,
  defaultExpandedDepth = 2,
}: JsonViewerProps) {
  const [raw, setRaw] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  let content: string | undefined;
  let parsed: JsonValue = null;
  let error = "";
  try {
    content = JSON.stringify(value, null, 2);
    if (content !== undefined) parsed = JSON.parse(content) as JsonValue;
  } catch {
    error = "This value cannot be displayed as JSON.";
  }

  async function copy() {
    if (content === undefined) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <section
      className={cn(
        "min-w-0 max-w-full overflow-hidden border bg-card [contain:inline-size] font-mono text-card-foreground [--font-mono:JetBrains_Mono_Variable,monospace]",
        className,
      )}
      aria-label={label}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/50 px-3 py-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <div className="flex items-center gap-1">
          <span role="status" className="text-xs text-muted-foreground">
            {copyState === "copied"
              ? "Copied"
              : copyState === "error"
                ? "Copy failed"
                : ""}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-pressed={raw}
            onClick={() => setRaw(!raw)}
          >
            {raw ? "Tree view" : "Raw JSON"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Copy ${label}`}
            disabled={content === undefined || Boolean(error)}
            onClick={() => void copy()}
          >
            {copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>
      </div>
      <div
        className="max-h-80 min-w-0 max-w-full overflow-x-auto overflow-y-auto p-3 text-xs leading-6"
        tabIndex={0}
        role="region"
        aria-label={`${label} content`}
      >
        {error || content === undefined ? (
          <p className="text-muted-foreground">{error || "Not available."}</p>
        ) : raw ? (
          <pre className="w-max min-w-full whitespace-pre font-mono">
            <code>{content}</code>
          </pre>
        ) : (
          <div className="w-max min-w-full whitespace-pre font-mono">
            <JsonNode
              value={parsed}
              depth={0}
              expandedDepth={defaultExpandedDepth}
            />
          </div>
        )}
      </div>
    </section>
  );
}
