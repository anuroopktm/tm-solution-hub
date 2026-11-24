import { cn } from "@/lib/utils";

export interface ChatWidgetTriggerProps {
  onClick: () => void;
  isStreaming?: boolean;
  className?: string;
}

/**
 * Chat Widget Trigger Button using the rounded-square CPU AI icon.
 */
export function ChatWidgetTrigger({
  onClick,
  isStreaming = false,
  className,
}: ChatWidgetTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat assistant"
      className={cn(
        "group/trigger fixed! bottom-4 right-4 z-40 flex size-10 items-center justify-center rounded-full",
        "bg-card text-foreground border border-border shadow-md",
        "hover:bg-muted/80 hover:border-primary/40 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "size-7 text-primary transition-all duration-300",
          "drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)] group-hover/trigger:drop-shadow-[0_0_4px_hsl(var(--primary))]",
          isStreaming &&
            "animate-pulse drop-shadow-[0_0_14px_hsl(var(--primary))]",
        )}
      >
        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 26V31" />
          <path d="M16 1V6" />
          <path d="M21 12.25V19.75" />
          <path d="M22.25 26V31" />
          <path d="M22.25 1V6" />
          <path d="M1 16L6 16" />
          <path d="M1 22.25H6" />
          <path d="M1 9.75H6" />
          <path d="M26 16H31" />
          <path d="M26 22.25H31" />
          <path d="M26 9.75H31" />
          <path d="M9.75 26V31" />
          <path d="M9.75 1V6" />
          <path d="M11 17.25H16" />
          <path d="M11 19.75V14.75C11 14.087 11.2634 13.4511 11.7323 12.9823C12.2011 12.5134 12.837 12.25 13.5 12.25C14.163 12.25 14.7989 12.5134 15.2677 12.9823C15.7366 13.4511 16 14.087 16 14.75V19.75" />
        </g>
      </svg>

      {/* Streaming Status Active Ping Dot */}
      {isStreaming && (
        <span className="absolute -top-0.5 -right-0.5 z-20 flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-primary ring-2 ring-background" />
        </span>
      )}
    </button>
  );
}
