import * as React from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageScrollerContextValue {
  autoScroll: boolean;
  isNearBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onViewportScroll: () => void;
}

const MessageScrollerContext =
  React.createContext<MessageScrollerContextValue | null>(null);

function useMessageScroller() {
  const context = React.useContext(MessageScrollerContext);
  if (!context) {
    throw new Error(
      "MessageScroller components must be used within <MessageScrollerProvider>",
    );
  }
  return context;
}

interface MessageScrollerProviderProps {
  children: React.ReactNode;
  autoScroll?: boolean;
  defaultScrollPosition?: "start" | "end" | "last-anchor";
}

function MessageScrollerProvider({
  children,
  autoScroll = true,
}: MessageScrollerProviderProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [isNearBottom, setIsNearBottom] = React.useState(true);

  const checkIfNearBottom = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return true;
    const threshold = 120;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom <= threshold;
  }, []);

  const onViewportScroll = React.useCallback(() => {
    setIsNearBottom(checkIfNearBottom());
  }, [checkIfNearBottom]);

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = viewportRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
    },
    [],
  );

  return (
    <MessageScrollerContext.Provider
      value={{
        autoScroll,
        isNearBottom,
        scrollToBottom,
        viewportRef,
        onViewportScroll,
      }}
    >
      {children}
    </MessageScrollerContext.Provider>
  );
}

function MessageScroller({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller"
      className={cn(
        "relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function MessageScrollerViewport({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const {
    viewportRef,
    onViewportScroll,
    autoScroll,
    scrollToBottom,
    isNearBottom,
  } = useMessageScroller();

  React.useEffect(() => {
    if (autoScroll && isNearBottom) {
      scrollToBottom("smooth");
    }
  }, [children, autoScroll, isNearBottom, scrollToBottom]);

  return (
    <ScrollArea
      viewportRef={viewportRef}
      onScroll={onViewportScroll}
      data-slot="message-scroller-viewport"
      className={cn("h-full w-full min-h-0 flex-1", className)}
      viewportClassName="scroll-smooth"
      {...props}
    >
      {children}
    </ScrollArea>
  );
}

function MessageScrollerContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller-content"
      className={cn("flex flex-col gap-4 p-4", className)}
      {...props}
    />
  );
}

interface MessageScrollerItemProps extends React.ComponentProps<"div"> {
  messageId?: string;
  scrollAnchor?: boolean;
}

function MessageScrollerItem({
  className,
  scrollAnchor = false,
  messageId,
  ...props
}: MessageScrollerItemProps) {
  return (
    <div
      data-slot="message-scroller-item"
      data-message-id={messageId}
      data-scroll-anchor={scrollAnchor ? "true" : undefined}
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function MessageScrollerButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isNearBottom, scrollToBottom } = useMessageScroller();

  if (isNearBottom) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-xs"
      onClick={() => scrollToBottom("smooth")}
      data-slot="message-scroller-button"
      className={cn(
        "absolute bottom-3 right-4 z-10 size-8 rounded-full shadow-md bg-background/90",
        className,
      )}
      aria-label="Scroll to bottom"
      {...props}
    >
      <ArrowDown className="size-3.5" />
    </Button>
  );
}

export {
  MessageScroller,
  MessageScrollerProvider,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
};
