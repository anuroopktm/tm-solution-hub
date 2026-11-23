import {
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  actions?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading = false,
  placeholder = "Message Solution Hub...",
  disabled = false,
  actions,
  compact = false,
  className,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to 200px
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, 200);
    const minHeight = compact ? 36 : 44;
    textarea.style.height = `${Math.max(nextHeight, minHeight)}px`;
  }, [value, compact]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      data-slot="ai-prompt-input"
      className={cn(
        "relative flex w-full flex-col rounded-xl border bg-background shadow-xs focus-within:ring-1 focus-within:ring-ring",
        compact ? "p-1.5" : "p-2",
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          "w-full resize-none bg-transparent placeholder:text-muted-foreground focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          compact ? "px-2.5 py-1.5 text-sm" : "px-3 py-2 text-sm",
        )}
      />

      <div
        className={cn(
          "flex items-center justify-between gap-2",
          compact ? "px-0.5 pt-0.5" : "px-1 pt-1",
        )}
      >
        <div className="flex items-center gap-1.5">{actions}</div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <Button
              type="button"
              size={compact ? "icon-xs" : "icon-sm"}
              variant="secondary"
              onClick={onStop}
              aria-label="Stop generation"
            >
              <Square
                className={
                  compact ? "size-3 fill-current" : "size-4 fill-current"
                }
              />
            </Button>
          ) : (
            <Button
              type="button"
              size={compact ? "icon-xs" : "icon-sm"}
              disabled={disabled || !value.trim()}
              onClick={onSubmit}
              aria-label="Send message"
            >
              <ArrowUp className={compact ? "size-3" : "size-4"} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
