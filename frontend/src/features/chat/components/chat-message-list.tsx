import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageItem } from "./chat-message-item";
import { ChatWelcome } from "./chat-welcome";
import type { ChatMessage } from "../types/chat.types";
import { cn } from "@/lib/utils";

export interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSelectPrompt: (promptText: string) => void;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
}

export function ChatMessageList({
  messages,
  isLoading = false,
  onSelectPrompt,
  className,
  contentClassName,
  compact = false,
}: ChatMessageListProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col gap-6 p-4",
          compact ? "max-w-sm" : "max-w-3xl sm:p-6",
        )}
      >
        <div className="flex justify-end">
          <Skeleton
            className={cn("rounded-xl", compact ? "h-7 w-32" : "h-9 w-48")}
          />
        </div>
        <div className="space-y-2">
          <Skeleton
            className={cn("rounded-xl", compact ? "h-3.5 w-48" : "h-4 w-72")}
          />
          <Skeleton
            className={cn("rounded-xl", compact ? "h-3.5 w-56" : "h-4 w-96")}
          />
          <Skeleton
            className={cn("rounded-xl", compact ? "h-3.5 w-36" : "h-4 w-60")}
          />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <ScrollArea className="h-full w-full min-h-0 flex-1">
        <div
          className={cn(
            "flex min-h-full w-full flex-col items-center p-4",
            compact ? "justify-start" : "sm:p-6",
          )}
        >
          <ChatWelcome
            compact={compact}
            onSelectPrompt={onSelectPrompt}
            className={contentClassName}
          />
        </div>
      </ScrollArea>
    );
  }

  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className={cn("min-h-0 flex-1", className)}>
        <MessageScrollerViewport>
          <MessageScrollerContent
            className={cn(
              compact ? "w-full space-y-3 p-4" : "mx-auto max-w-3xl pb-4",
              contentClassName,
            )}
          >
            {messages.map((message) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === "user"}
              >
                <ChatMessageItem compact={compact} message={message} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
