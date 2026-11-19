import type { ReactNode } from "react";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatComposer } from "./chat-composer";
import { ChatHistoryDialog } from "./chat-history-dialog";
import { useChat } from "../hooks/use-chat";

export interface ChatPageProps {
  initialConversationId?: string | null;
  headerPrefix?: ReactNode;
}

export function ChatPage({
  initialConversationId,
  headerPrefix,
}: ChatPageProps) {
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
  } = useChat(initialConversationId);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <ChatHeader
        title={activeTitle}
        headerPrefix={headerPrefix}
        onNewChat={startNewChat}
        onOpenHistory={() => setHistoryDialogOpen(true)}
      />

      {/* Messages */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatMessageList
          messages={messages}
          isLoading={isLoadingMessages}
          onSelectPrompt={(text) => sendMessage(text)}
        />
      </div>

      {/* Composer */}
      <ChatComposer
        onSendMessage={sendMessage}
        onStop={stopGeneration}
        isStreaming={isStreaming}
      />

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
