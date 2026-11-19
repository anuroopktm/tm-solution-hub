import { MessageScroller } from "@/components/ai-elements/message-scroller";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessageItem } from "./chat-message-item";
import { ChatWelcome } from "./chat-welcome";
import type { ChatMessage } from "../types/chat.types";

export interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSelectPrompt: (promptText: string) => void;
}

export function ChatMessageList({
  messages,
  isLoading = false,
  onSelectPrompt,
}: ChatMessageListProps) {
  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <div className="flex justify-end">
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return <ChatWelcome onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <MessageScroller>
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}
    </MessageScroller>
  );
}
