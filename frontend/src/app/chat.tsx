import { useParams } from "react-router-dom";
import { ChatPage as ChatWorkspace } from "@/features/chat/components/chat-page";

export default function ChatPage() {
  const { conversationId } = useParams();

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <ChatWorkspace initialConversationId={conversationId} />
    </div>
  );
}
