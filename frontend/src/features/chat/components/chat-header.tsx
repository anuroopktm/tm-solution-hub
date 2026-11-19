import type { ReactNode } from "react";
import { Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ChatHeaderProps {
  title?: string;
  onNewChat: () => void;
  onOpenHistory: () => void;
  headerPrefix?: ReactNode;
}

export function ChatHeader({
  title = "New chat",
  onNewChat,
  onOpenHistory,
  headerPrefix,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex min-w-0 items-center gap-2">
        {headerPrefix}
        <span className="text-sm font-semibold">Solution Hub Chat</span>
        <span className="text-muted-foreground">/</span>
        <span className="max-w-xs truncate text-xs text-muted-foreground">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenHistory}
        >
          <History className="size-4" />
          <span>History</span>
        </Button>

        <Button type="button" size="sm" onClick={onNewChat}>
          <Plus className="size-4" />
          <span>New chat</span>
        </Button>
      </div>
    </header>
  );
}
