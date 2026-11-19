import { useState } from "react";
import { PromptInput } from "@/components/ai-elements/prompt-input";

export interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatComposer({
  onSendMessage,
  onStop,
  isStreaming = false,
  disabled = false,
}: ChatComposerProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim() || isStreaming) return;
    const text = value;
    setValue("");
    onSendMessage(text);
  };

  return (
    <div className="shrink-0 p-4">
      <div className="mx-auto max-w-3xl space-y-2">
        <PromptInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          onStop={onStop}
          isLoading={isStreaming}
          disabled={disabled}
          placeholder="Message Solution Hub..."
        />
        <p className="text-center text-xs text-muted-foreground select-none">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
