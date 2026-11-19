import { apiClient } from "@/api/axios";
import type {
  Conversation,
  ConversationDetail,
  ChatMessage,
} from "../types/chat.types";

interface BaseResponse<T> {
  detail: string;
  data: T;
}

interface RawConversation {
  id: string;
  user_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface RawMessage {
  id: string;
  conversation_id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

interface RawConversationDetail extends RawConversation {
  messages: RawMessage[];
}

function mapConversation(raw: RawConversation): Conversation {
  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapMessage(raw: RawMessage): ChatMessage {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    role: raw.role,
    content: raw.content,
    createdAt: raw.created_at,
    status: "completed",
  };
}

export const chatApi = {
  getConversations: async (skip = 0, limit = 50): Promise<Conversation[]> => {
    const { data } = await apiClient.get<BaseResponse<RawConversation[]>>(
      "/conversations/",
      {
        params: { skip, limit },
      },
    );
    return (data.data || []).map(mapConversation);
  },

  getConversation: async (id: string): Promise<ConversationDetail> => {
    const { data } = await apiClient.get<BaseResponse<RawConversationDetail>>(
      `/conversations/${id}`,
    );
    const raw = data.data;
    return {
      ...mapConversation(raw),
      messages: (raw.messages || []).map(mapMessage),
    };
  },

  createConversation: async (title?: string): Promise<Conversation> => {
    const { data } = await apiClient.post<BaseResponse<RawConversation>>(
      "/conversations/",
      { title },
    );
    return mapConversation(data.data);
  },

  updateConversationTitle: async (
    id: string,
    title: string,
  ): Promise<Conversation> => {
    const { data } = await apiClient.patch<BaseResponse<RawConversation>>(
      `/conversations/${id}`,
      { title },
    );
    return mapConversation(data.data);
  },

  deleteConversation: async (id: string): Promise<void> => {
    await apiClient.delete(`/conversations/${id}`);
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const { data } = await apiClient.get<BaseResponse<RawMessage[]>>(
      `/conversations/${conversationId}/messages`,
    );
    return (data.data || []).map(mapMessage);
  },
};
