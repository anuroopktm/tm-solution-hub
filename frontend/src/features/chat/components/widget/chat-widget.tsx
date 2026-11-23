import { useLocation } from "react-router-dom";
import { Maximize2, X, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessageList } from "../chat-message-list";
import { ChatComposer } from "../chat-composer";
import { useChatContext } from "../../context/chat-context";

export function ChatWidget() {
  const location = useLocation();
  const {
    messages,
    isStreaming,
    isLoadingMessages,
    isWidgetOpen,
    openWidget,
    closeWidget,
    maximizeToPage,
    startNewChat,
    sendMessage,
    stopGeneration,
  } = useChatContext();

  // Suppress floating widget when already on the dedicated chat page
  if (location.pathname.startsWith("/chat")) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button (FAB) positioned to match page p-4 padding */}
      {!isWidgetOpen && (
        <Button
          type="button"
          size="icon"
          onClick={openWidget}
          className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg"
          aria-label="Open chat assistant"
        >
          <MessageSquare className="size-5" />
          {isStreaming && (
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-primary ring-2 ring-background" />
          )}
        </Button>
      )}

      {/* Floating Mini Chat Window */}
      {isWidgetOpen && (
        <div
          role="dialog"
          aria-label="Chat assistant widget"
          className="fixed bottom-4 right-4 z-40 flex h-135 w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl bg-background text-foreground shadow-2xl ring-1 ring-border"
        >
          {/* Header Action Bar: Icons left-aligned with no borders or title */}
          <div className="flex h-9 shrink-0 items-center justify-start gap-1 px-4 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={startNewChat}
              title="New chat"
            >
              <Plus className="size-4" />
              <span className="sr-only">New chat</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={maximizeToPage}
              title="Expand"
            >
              <Maximize2 className="size-3.5" />
              <span className="sr-only">Expand</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={closeWidget}
              title="Close"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Messages & Composer */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <ChatMessageList
                compact
                messages={messages}
                isLoading={isLoadingMessages}
                onSelectPrompt={(text) => sendMessage(text)}
              />
            </div>

            {/* Composer: in-flow so full chat is completely visible */}
            <div className="shrink-0 p-4 pt-1">
              <ChatComposer
                compact
                floating
                onSendMessage={sendMessage}
                onStop={stopGeneration}
                isStreaming={isStreaming}
                className="p-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
