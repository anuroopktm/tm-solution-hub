import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useChatHistory } from "./use-chat-history";
import { chatApi } from "../services/chat-api";
import type { Conversation } from "../types/chat.types";

vi.mock("../services/chat-api", () => ({
  chatApi: {
    getConversations: vi.fn(),
    updateConversationTitle: vi.fn(),
    deleteConversation: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useChatHistory", () => {
  const mockConversations: Conversation[] = [
    {
      id: "c1",
      title: "Understanding LangGraph checkpoints",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c2",
      title: "FastAPI streaming implementation",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and groups conversations", async () => {
    vi.mocked(chatApi.getConversations).mockResolvedValueOnce(
      mockConversations,
    );

    const { result } = renderHook(() => useChatHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.allConversations).toHaveLength(2);
      expect(result.current.groupedConversations.length).toBeGreaterThan(0);
    });
  });

  it("filters conversations by search query", async () => {
    vi.mocked(chatApi.getConversations).mockResolvedValueOnce(
      mockConversations,
    );

    const { result } = renderHook(() => useChatHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSearchQuery("LangGraph");
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toContain("LangGraph");
  });

  it("renames conversation successfully", async () => {
    vi.mocked(chatApi.getConversations).mockResolvedValueOnce(
      mockConversations,
    );
    vi.mocked(chatApi.updateConversationTitle).mockResolvedValueOnce({
      ...mockConversations[0],
      title: "New LangGraph Title",
    });

    const { result } = renderHook(() => useChatHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.renameConversation("c1", "New LangGraph Title");
    });

    expect(chatApi.updateConversationTitle).toHaveBeenCalledWith(
      "c1",
      "New LangGraph Title",
    );
  });

  it("deletes conversation successfully", async () => {
    vi.mocked(chatApi.getConversations).mockResolvedValueOnce(
      mockConversations,
    );
    vi.mocked(chatApi.deleteConversation).mockResolvedValueOnce();

    const { result } = renderHook(() => useChatHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteConversation("c1");
    });

    expect(chatApi.deleteConversation).toHaveBeenCalledWith("c1");
  });
});
