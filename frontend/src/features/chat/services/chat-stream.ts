import { authStorage } from "@/utils/auth-storage";
import type {
  StreamCallbacks,
  SSEMetadataEvent,
  SSEToolCallEvent,
  SSEToolResultEvent,
  SSEDoneEvent,
} from "../types/chat.types";

export interface StreamChatOptions {
  conversationId?: string | null;
  message: string;
  signal?: AbortSignal;
  callbacks: StreamCallbacks;
}

export async function streamChatMessage({
  conversationId,
  message,
  signal,
  callbacks,
}: StreamChatOptions): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const url = `${baseUrl.replace(/\/$/, "")}/chat/stream`;

  const token = authStorage.getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const payload: { message: string; conversation_id?: string } = { message };
  if (conversationId) {
    payload.conversation_id = conversationId;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let errorDetail = "Failed to stream message";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `${response.status} ${response.statusText}`;
    }
    const err = new Error(errorDetail);
    callbacks.onError?.(err);
    throw err;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const err = new Error("ReadableStream not supported on response");
    callbacks.onError?.(err);
    throw err;
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      // The last element is incomplete if buffer didn't end with \n\n
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        if (!block.trim()) continue;

        let eventType = "message";
        let dataStr = "";

        const lines = block.split("\n");
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            dataStr = line.slice(6).trim();
          }
        }

        try {
          const parsedData = dataStr ? JSON.parse(dataStr) : {};

          switch (eventType) {
            case "metadata":
              callbacks.onMetadata?.(parsedData as SSEMetadataEvent);
              break;
            case "content":
              if (parsedData.chunk) {
                callbacks.onContentChunk?.(parsedData.chunk as string);
              }
              break;
            case "tool_call":
              callbacks.onToolCall?.(parsedData as SSEToolCallEvent);
              break;
            case "tool_result":
              callbacks.onToolResult?.(parsedData as SSEToolResultEvent);
              break;
            case "error":
              callbacks.onError?.(
                new Error(parsedData.message || "Stream error"),
              );
              break;
            case "done":
              callbacks.onDone?.(parsedData as SSEDoneEvent);
              break;
            default:
              break;
          }
        } catch {
          // If data isn't JSON, handle as raw chunk
          if (eventType === "content") {
            callbacks.onContentChunk?.(dataStr);
          }
        }
      }
    }
  } catch (err: unknown) {
    if (signal?.aborted) {
      // Stream deliberately aborted by user
      return;
    }
    const error = err instanceof Error ? err : new Error(String(err));
    callbacks.onError?.(error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
