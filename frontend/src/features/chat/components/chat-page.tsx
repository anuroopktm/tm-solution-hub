import { useEffect, type ReactNode } from "react";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatComposer } from "./chat-composer";
import { ChatHistoryDialog } from "./chat-history-dialog";
import { useChatContext } from "../context/chat-context";

export interface ChatPageProps {
  initialConversationId?: string | null;
  headerPrefix?: ReactNode;
}

export function ChatPage({ initialConversationId }: ChatPageProps) {
  const {
    activeConversationId,
    activeTitle,
    messages,
    isStreaming,
    isLoadingMessages,
    historyDialogOpen,
    setHistoryDialogOpen,
    sendMessage,
    stopGeneration,
    startNewChat,
    selectConversation,
  } = useChatContext();

  // Synchronize route conversationId if explicitly loaded via URL
  useEffect(() => {
    if (
      initialConversationId &&
      initialConversationId !== activeConversationId
    ) {
      selectConversation(initialConversationId);
    }
  }, [initialConversationId, activeConversationId, selectConversation]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Header unified with PageHeader */}
      <ChatHeader
        title={activeTitle}
        onNewChat={startNewChat}
        onOpenHistory={() => setHistoryDialogOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <ChatMessageList
            messages={messages}
            isLoading={isLoadingMessages}
            onSelectPrompt={(text) => sendMessage(text)}
          />
        </div>

        {/* Composer: In-flow so full chat is completely visible */}
        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className="mx-auto max-w-3xl">
            <ChatComposer
              floating
              onSendMessage={sendMessage}
              onStop={stopGeneration}
              isStreaming={isStreaming}
              className="p-0"
            />
          </div>
        </div>
      </div>

      {/* History modal */}
      <ChatHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
      />
    </div>
  );
}
