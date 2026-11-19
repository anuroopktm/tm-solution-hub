import { MessageSquareDashed } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ChatEmptyState({
  title = "No conversations found",
  description = "Start a new chat to begin exploring solutions.",
  className,
}: ChatEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <MessageSquareDashed className="size-5" />
      </div>
      <h3 className="mt-3 text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
