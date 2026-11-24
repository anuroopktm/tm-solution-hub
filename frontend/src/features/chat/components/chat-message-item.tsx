import { useState, type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { Message, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { TraceStep } from "@/components/ai-elements/trace";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "../types/chat.types";
import { cn } from "@/lib/utils";

export interface ChatMessageItemProps {
  message: ChatMessage;
  compact?: boolean;
}

export function ChatMessageItem({
  message,
  compact = false,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy error
    }
  };

  if (isUser) {
    return (
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent
              className={cn(
                "rounded-xl",
                compact ? "px-3.5 py-2 text-sm" : undefined,
              )}
            >
              <p className="whitespace-pre-wrap wrap-break-word text-sm">
                {message.content}
              </p>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message align="start" className="w-full max-w-full">
      <MessageContent className="w-full max-w-full">
        <Bubble
          variant="ghost"
          align="start"
          className="w-full max-w-none! sm:max-w-none!"
        >
          <BubbleContent className="w-full max-w-none! rounded-xl p-0 shadow-none">
            <div
              className={cn(
                "w-full min-w-0",
                compact ? "space-y-2.5 text-sm" : "space-y-3 text-sm",
              )}
            >
              {/* Tool execution steps */}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className={compact ? "space-y-1" : "space-y-1.5"}>
                  {message.toolCalls.map((tool) => (
                    <TraceStep
                      key={tool.toolId}
                      title={tool.name}
                      status={tool.status}
                      details={tool.result || tool.arguments}
                    />
                  ))}
                </div>
              )}

              {/* Markdown content */}
              <div className="w-full min-w-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({
                      className,
                      children,
                      ...props
                    }: ComponentProps<"code">) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");
                      const isMultiLine = codeString.includes("\n");

                      if (match || isMultiLine) {
                        return (
                          <CodeBlock
                            language={match ? match[1] : "text"}
                            code={codeString}
                          />
                        );
                      }

                      return (
                        <code
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    table({ children, ...props }: ComponentProps<"table">) {
                      return (
                        <div
                          className={cn(
                            "my-2.5 w-full overflow-x-auto rounded-xl border border-border",
                            compact ? "text-xs" : "text-sm",
                          )}
                        >
                          <table
                            className="w-full border-collapse text-left"
                            {...props}
                          >
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children, ...props }: ComponentProps<"thead">) {
                      return (
                        <thead
                          className="border-b border-border bg-muted/60"
                          {...props}
                        >
                          {children}
                        </thead>
                      );
                    },
                    tbody({ children, ...props }: ComponentProps<"tbody">) {
                      return (
                        <tbody
                          className="[&_tr:last-child_td]:border-b-0"
                          {...props}
                        >
                          {children}
                        </tbody>
                      );
                    },
                    tr({ children, ...props }: ComponentProps<"tr">) {
                      return (
                        <tr
                          className="border-b border-border/60 transition-colors hover:bg-muted/30"
                          {...props}
                        >
                          {children}
                        </tr>
                      );
                    },
                    th({ children, ...props }: ComponentProps<"th">) {
                      return (
                        <th
                          className={cn(
                            "border-b border-border bg-muted/60 font-semibold text-foreground",
                            compact ? "px-2.5 py-1.5" : "px-3 py-2",
                          )}
                          {...props}
                        >
                          {children}
                        </th>
                      );
                    },
                    td({ children, ...props }: ComponentProps<"td">) {
                      return (
                        <td
                          className={cn(
                            "border-b border-border/60 text-muted-foreground",
                            compact ? "px-2.5 py-1.5" : "px-3 py-2",
                          )}
                          {...props}
                        >
                          {children}
                        </td>
                      );
                    },
                    a({ href, children, ...props }: ComponentProps<"a">) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-4 hover:underline"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    ul({ children, ...props }: ComponentProps<"ul">) {
                      return (
                        <ul
                          className={cn(
                            "list-disc pl-5",
                            compact ? "my-1.5 space-y-0.5" : "my-2 space-y-1",
                          )}
                          {...props}
                        >
                          {children}
                        </ul>
                      );
                    },
                    ol({ children, ...props }: ComponentProps<"ol">) {
                      return (
                        <ol
                          className={cn(
                            "list-decimal pl-5",
                            compact ? "my-1.5 space-y-0.5" : "my-2 space-y-1",
                          )}
                          {...props}
                        >
                          {children}
                        </ol>
                      );
                    },
                    li({ children, ...props }: ComponentProps<"li">) {
                      return (
                        <li className="leading-relaxed" {...props}>
                          {children}
                        </li>
                      );
                    },
                    h1({ children, ...props }: ComponentProps<"h1">) {
                      return (
                        <h1
                          className={cn(
                            "font-semibold tracking-tight first:mt-0",
                            compact
                              ? "mt-2.5 mb-1 text-base"
                              : "mt-4 mb-2 text-lg",
                          )}
                          {...props}
                        >
                          {children}
                        </h1>
                      );
                    },
                    h2({ children, ...props }: ComponentProps<"h2">) {
                      return (
                        <h2
                          className={cn(
                            "font-semibold tracking-tight first:mt-0",
                            compact
                              ? "mt-2 mb-1 text-sm"
                              : "mt-3 mb-2 text-base",
                          )}
                          {...props}
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3({ children, ...props }: ComponentProps<"h3">) {
                      return (
                        <h3
                          className={cn(
                            "font-semibold tracking-tight first:mt-0",
                            compact
                              ? "mt-2 mb-0.5 text-sm"
                              : "mt-3 mb-1 text-sm",
                          )}
                          {...props}
                        >
                          {children}
                        </h3>
                      );
                    },
                    p({ children, ...props }: ComponentProps<"p">) {
                      return (
                        <p
                          className={cn(
                            "leading-relaxed first:mt-0 last:mb-0",
                            compact ? "my-1.5" : "my-2",
                          )}
                          {...props}
                        >
                          {children}
                        </p>
                      );
                    },
                    blockquote({
                      children,
                      ...props
                    }: ComponentProps<"blockquote">) {
                      return (
                        <blockquote
                          className={cn(
                            "border-l-2 pl-3 italic text-muted-foreground",
                            compact ? "my-1.5" : "my-2",
                          )}
                          {...props}
                        >
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Streaming cursor */}
              {isStreaming && (
                <span className="inline-block size-2 animate-pulse rounded-full bg-primary" />
              )}

              {/* Action bar */}
              {!isStreaming && message.content && (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size={compact ? "icon-xs" : "icon-sm"}
                    onClick={handleCopy}
                    aria-label={copied ? "Copied message" : "Copy message"}
                  >
                    {copied ? (
                      <Check className={compact ? "size-3.5" : "size-4"} />
                    ) : (
                      <Copy className={compact ? "size-3.5" : "size-4"} />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
