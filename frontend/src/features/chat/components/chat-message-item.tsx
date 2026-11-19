import { useState, type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { Message } from "@/components/ai-elements/message";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { TraceStep } from "@/components/ai-elements/trace";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "../types/chat.types";

export interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
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
      <Message role="user">
        <div className="max-w-[85%] rounded-md bg-muted px-4 py-2 text-sm sm:max-w-[75%]">
          <p className="whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
        </div>
      </Message>
    );
  }

  return (
    <Message role="assistant">
      <div className="w-full space-y-3 text-sm">
        {/* Tool execution steps */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1.5">
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
        <div>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }: ComponentProps<"code">) {
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
                  <div className="my-3 overflow-x-auto rounded-md border">
                    <table
                      className="w-full border-collapse text-left text-sm"
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children, ...props }: ComponentProps<"th">) {
                return (
                  <th
                    className="border-b bg-muted px-3 py-2 font-medium"
                    {...props}
                  >
                    {children}
                  </th>
                );
              },
              td({ children, ...props }: ComponentProps<"td">) {
                return (
                  <td
                    className="border-b px-3 py-2 text-muted-foreground last:border-none"
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
                  <ul className="my-2 list-disc space-y-1 pl-5" {...props}>
                    {children}
                  </ul>
                );
              },
              ol({ children, ...props }: ComponentProps<"ol">) {
                return (
                  <ol className="my-2 list-decimal space-y-1 pl-5" {...props}>
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
                    className="mt-4 mb-2 text-lg font-semibold tracking-tight first:mt-0"
                    {...props}
                  >
                    {children}
                  </h1>
                );
              },
              h2({ children, ...props }: ComponentProps<"h2">) {
                return (
                  <h2
                    className="mt-3 mb-2 text-base font-semibold tracking-tight first:mt-0"
                    {...props}
                  >
                    {children}
                  </h2>
                );
              },
              h3({ children, ...props }: ComponentProps<"h3">) {
                return (
                  <h3
                    className="mt-3 mb-1 text-sm font-semibold tracking-tight first:mt-0"
                    {...props}
                  >
                    {children}
                  </h3>
                );
              },
              p({ children, ...props }: ComponentProps<"p">) {
                return (
                  <p
                    className="my-2 leading-relaxed first:mt-0 last:mb-0"
                    {...props}
                  >
                    {children}
                  </p>
                );
              },
              blockquote({ children, ...props }: ComponentProps<"blockquote">) {
                return (
                  <blockquote
                    className="my-2 border-l-2 pl-3 italic text-muted-foreground"
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
              size="icon-sm"
              onClick={handleCopy}
              aria-label={copied ? "Copied message" : "Copy message"}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </Message>
  );
}
