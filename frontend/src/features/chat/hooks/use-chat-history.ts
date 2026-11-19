import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../services/chat-api";
import { groupConversationsByDate } from "../utils/chat-formatters";
import type { Conversation, GroupedConversations } from "../types/chat.types";

export const CHAT_QUERY_KEYS = {
  conversations: ["chat", "conversations"] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
  messages: (id: string) => ["chat", "messages", id] as const,
};

export function useChatHistory() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: CHAT_QUERY_KEYS.conversations,
    queryFn: () => chatApi.getConversations(),
    staleTime: 1000 * 60, // 1 minute
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      chatApi.updateConversationTitle(id, title),
    onSuccess: (updated) => {
      queryClient.setQueryData<Conversation[]>(
        CHAT_QUERY_KEYS.conversations,
        (old = []) => old.map((c) => (c.id === updated.id ? updated : c)),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chatApi.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Conversation[]>(
        CHAT_QUERY_KEYS.conversations,
        (old = []) => old.filter((c) => c.id !== deletedId),
      );
    },
  });

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const groupedConversations: GroupedConversations[] = useMemo(() => {
    return groupConversationsByDate(filteredConversations);
  }, [filteredConversations]);

  return {
    conversations: filteredConversations,
    allConversations: conversations,
    groupedConversations,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    refetch,
    renameConversation: (id: string, title: string) =>
      renameMutation.mutateAsync({ id, title }),
    deleteConversation: (id: string) => deleteMutation.mutateAsync(id),
    isRenaming: renameMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
