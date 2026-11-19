import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../services/chat-api";
import { useChatStream } from "./use-chat-stream";
import { CHAT_QUERY_KEYS } from "./use-chat-history";
import type { ChatMessage, ToolCallState } from "../types/chat.types";

export function useChat(initialConversationId?: string | null) {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(initialConversationId ?? null);
  const [activeTitle, setActiveTitle] = useState<string>("New chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const { isStreaming, startStream, stopStream } = useChatStream();

  // Reference to current active conversation id for async callbacks
  const activeIdRef = useRef<string | null>(activeConversationId);

  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Select an existing conversation from history
  const selectConversation = useCallback(
    async (conversationId: string) => {
      // Abort active streaming if any
      stopStream();

      setIsLoadingMessages(true);
      setActiveConversationId(conversationId);
      activeIdRef.current = conversationId;

      try {
        const detail = await chatApi.getConversation(conversationId);
        setActiveTitle(detail.title || "Conversation");
        setMessages(detail.messages || []);
      } catch {
        // Fallback: try fetching just messages
        try {
          const msgs = await chatApi.getMessages(conversationId);
          setMessages(msgs || []);
        } catch {
          // If conversation could not be loaded
          setMessages([]);
        }
      } finally {
        setIsLoadingMessages(false);
        setHistoryDialogOpen(false);
      }
    },
    [stopStream],
  );

  // Start a fresh chat session
  const startNewChat = useCallback(() => {
    stopStream();
    setActiveConversationId(null);
    activeIdRef.current = null;
    setActiveTitle("New chat");
    setMessages([]);
  }, [stopStream]);

  // Send a message and stream the response
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsgId = `user-${Date.now()}`;
      const asstMsgId = `asst-${Date.now()}`;

      const userMessage: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
        status: "completed",
      };

      const assistantMessage: ChatMessage = {
        id: asstMsgId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "streaming",
        toolCalls: [],
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      try {
        await startStream({
          conversationId: activeIdRef.current,
          message: trimmed,
          callbacks: {
            onMetadata: (data) => {
              if (!activeIdRef.current && data.conversation_id) {
                setActiveConversationId(data.conversation_id);
                activeIdRef.current = data.conversation_id;
                setActiveTitle(data.title || trimmed.slice(0, 30));
                // Invalidate conversations list so history updates
                queryClient.invalidateQueries({
                  queryKey: CHAT_QUERY_KEYS.conversations,
                });
              }
            },
            onContentChunk: (chunk) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === asstMsgId ? { ...m, content: m.content + chunk } : m,
                ),
              );
            },
            onToolCall: (event) => {
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== asstMsgId) return m;
                  const newTool: ToolCallState = {
                    toolId: event.tool_id,
                    name: event.name,
                    arguments: event.arguments,
                    status: "running",
                  };
                  return {
                    ...m,
                    toolCalls: [...(m.toolCalls || []), newTool],
                  };
                }),
              );
            },
            onToolResult: (event) => {
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== asstMsgId) return m;
                  return {
                    ...m,
                    toolCalls: (m.toolCalls || []).map((t) =>
                      t.toolId === event.tool_id
                        ? { ...t, result: event.result, status: "completed" }
                        : t,
                    ),
                  };
                }),
              );
            },
            onDone: (data) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === asstMsgId
                    ? {
                        ...m,
                        content: data.full_response || m.content,
                        status: "completed",
                      }
                    : m,
                ),
              );
              queryClient.invalidateQueries({
                queryKey: CHAT_QUERY_KEYS.conversations,
              });
            },
            onError: (_err) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === asstMsgId
                    ? {
                        ...m,
                        content:
                          m.content ||
                          "I encountered an error while processing your request. Please check your connection or try again.",
                        status: "error",
                      }
                    : m,
                ),
              );
            },
          },
        });
      } catch {
        // Fallback handling if backend stream fails to start (e.g. backend server offline)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === asstMsgId
              ? {
                  ...m,
                  content:
                    m.content ||
                    "I am currently unable to reach the Solution Hub service. Please ensure the backend is running, or try again later.",
                  status: "error",
                }
              : m,
          ),
        );
      }
    },
    [isStreaming, startStream, queryClient],
  );

  return {
    activeConversationId,
    activeTitle,
    messages,
    isStreaming,
    isLoadingMessages,
    historyDialogOpen,
    setHistoryDialogOpen,
    sendMessage,
    stopGeneration: stopStream,
    startNewChat,
    selectConversation,
  };
}
