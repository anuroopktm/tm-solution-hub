import { useState, useRef, useCallback, useEffect } from "react";
import { streamChatMessage } from "../services/chat-stream";
import type { StreamCallbacks } from "../types/chat.types";

export interface StreamChatParams {
  conversationId?: string | null;
  message: string;
  callbacks: StreamCallbacks;
}

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(
    async ({ conversationId, message, callbacks }: StreamChatParams) => {
      // Abort previous stream if any
      stopStream();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsStreaming(true);

      try {
        await streamChatMessage({
          conversationId,
          message,
          signal: controller.signal,
          callbacks: {
            ...callbacks,
            onDone: (data) => {
              setIsStreaming(false);
              callbacks.onDone?.(data);
            },
            onError: (err) => {
              setIsStreaming(false);
              callbacks.onError?.(err);
            },
          },
        });
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setIsStreaming(false);
          throw err;
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          setIsStreaming(false);
        }
      }
    },
    [stopStream],
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isStreaming,
    startStream,
    stopStream,
  };
}
