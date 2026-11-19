import { useParams } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ChatPage as ChatWorkspace } from "@/features/chat/components/chat-page";

export default function ChatPage() {
  const { conversationId } = useParams();

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden">
      <ChatWorkspace
        initialConversationId={conversationId}
        headerPrefix={
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        }
      />
    </div>
  );
}
