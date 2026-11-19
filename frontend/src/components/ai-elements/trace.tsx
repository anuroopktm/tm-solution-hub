import { useState, type ComponentProps } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Wrench,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TraceStepProps extends ComponentProps<"div"> {
  title: string;
  status?: "pending" | "running" | "completed" | "error";
  details?: unknown;
  defaultExpanded?: boolean;
}

export function TraceStep({
  title,
  status = "completed",
  details,
  defaultExpanded = false,
  className,
  ...props
}: TraceStepProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasDetails = details !== undefined && details !== null;

  return (
    <div
      data-slot="ai-trace-step"
      className={cn("rounded-md border text-xs", className)}
      {...props}
    >
      <button
        type="button"
        disabled={!hasDetails}
        onClick={() => hasDetails && setIsExpanded((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between px-3 py-2 text-left font-medium select-none",
          hasDetails ? "cursor-pointer hover:bg-muted/50" : "cursor-default",
        )}
      >
        <div className="flex items-center gap-2">
          {status === "running" ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : status === "completed" ? (
            <CheckCircle2 className="size-4 text-primary" />
          ) : (
            <Wrench className="size-4 text-muted-foreground" />
          )}
          <span className="font-mono text-xs">{title}</span>
        </div>

        {hasDetails && (
          <div className="text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </div>
        )}
      </button>

      {isExpanded && hasDetails && (
        <div className="border-t bg-muted/50 px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground">
          <pre className="overflow-x-auto whitespace-pre-wrap break-all">
            {typeof details === "string"
              ? details
              : JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
