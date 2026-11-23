import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/use-chat";
import type { ChatMessage } from "../types/chat.types";

export interface ChatContextValue {
  // Session & Streaming
  activeConversationId: string | null;
  activeTitle: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoadingMessages: boolean;
  historyDialogOpen: boolean;
  setHistoryDialogOpen: (open: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  startNewChat: () => void;
  selectConversation: (conversationId: string) => Promise<void>;

  // Floating In-App Widget State
  isWidgetOpen: boolean;
  setIsWidgetOpen: (open: boolean) => void;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  maximizeToPage: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export interface ChatProviderProps {
  children: ReactNode;
  initialConversationId?: string | null;
}

export function ChatProvider({
  children,
  initialConversationId,
}: ChatProviderProps) {
  const navigate = useNavigate();
  const chat = useChat(initialConversationId);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const openWidget = useCallback(() => setIsWidgetOpen(true), []);
  const closeWidget = useCallback(() => setIsWidgetOpen(false), []);
  const toggleWidget = useCallback(() => setIsWidgetOpen((prev) => !prev), []);

  const maximizeToPage = useCallback(() => {
    setIsWidgetOpen(false);
    if (chat.activeConversationId) {
      navigate(`/chat/${chat.activeConversationId}`);
    } else {
      navigate("/chat");
    }
  }, [chat.activeConversationId, navigate]);

  const value = useMemo<ChatContextValue>(
    () => ({
      ...chat,
      isWidgetOpen,
      setIsWidgetOpen,
      openWidget,
      closeWidget,
      toggleWidget,
      maximizeToPage,
    }),
    [chat, isWidgetOpen, openWidget, closeWidget, toggleWidget, maximizeToPage],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a <ChatProvider>");
  }
  return context;
}
