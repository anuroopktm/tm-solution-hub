import { useState } from "react";
import { PromptInput } from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";

export interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  compact?: boolean;
  floating?: boolean;
  className?: string;
}

export function ChatComposer({
  onSendMessage,
  onStop,
  isStreaming = false,
  disabled = false,
  compact = false,
  floating = false,
  className,
}: ChatComposerProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim() || isStreaming) return;
    const text = value;
    setValue("");
    onSendMessage(text);
  };

  return (
    <div
      className={cn(
        "shrink-0",
        !floating && (compact ? "p-3 pt-0" : "p-4"),
        className,
      )}
    >
      <div className={cn("mx-auto space-y-2", !compact && "max-w-3xl")}>
        <PromptInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          onStop={onStop}
          isLoading={isStreaming}
          disabled={disabled}
          compact={compact}
          placeholder="Message Solution Hub..."
          className={cn(
            floating &&
              "rounded-xl border border-input/80 bg-background shadow-lg shadow-black/5 dark:shadow-black/20 focus-within:ring-1 focus-within:ring-ring",
          )}
        />
        {!compact && (
          <p className="text-center text-xs text-muted-foreground select-none">
            AI can make mistakes. Verify important information.
          </p>
        )}
      </div>
    </div>
  );
}
