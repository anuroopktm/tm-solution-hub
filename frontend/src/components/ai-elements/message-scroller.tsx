import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type ComponentProps,
} from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface MessageScrollerProps extends ComponentProps<"div"> {
  children: ReactNode;
  autoScroll?: boolean;
}

export function MessageScroller({
  children,
  autoScroll = true,
  className,
  ...props
}: MessageScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isNearBottomRef = useRef(true);

  const checkIfNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const threshold = 120;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom <= threshold;
  }, []);

  const handleScroll = () => {
    const nearBottom = checkIfNearBottom();
    isNearBottomRef.current = nearBottom;
    setShowScrollBottom(!nearBottom);
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // When children update, auto-scroll if user was already near bottom
  useEffect(() => {
    if (autoScroll && isNearBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [children, autoScroll, scrollToBottom]);

  return (
    <div className="relative flex-1 overflow-hidden" {...props}>
      <ScrollArea
        viewportRef={containerRef}
        onScroll={handleScroll}
        data-slot="ai-message-scroller"
        className={cn("h-full w-full", className)}
        viewportClassName="px-4 py-6 scroll-smooth"
      >
        <div className="mx-auto max-w-3xl space-y-4">
          {children}
          <div ref={bottomRef} className="h-px" />
        </div>
      </ScrollArea>

      {showScrollBottom && (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-4 right-8 z-10 size-8 rounded-full shadow-md"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="size-4" />
        </Button>
      )}
    </div>
  );
}
