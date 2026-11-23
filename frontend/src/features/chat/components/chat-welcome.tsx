import { Compass, FileSearch, Lightbulb, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatWelcomeProps {
  onSelectPrompt: (promptText: string) => void;
  className?: string;
  compact?: boolean;
}

const SUGGESTIONS = [
  {
    icon: Compass,
    title: "Explore solutions",
    description:
      "Find relevant solutions and capabilities across all categories",
    prompt:
      "What solutions are available in Solution Hub? Give me a comprehensive overview.",
  },
  {
    icon: FileSearch,
    title: "Analyze information",
    description: "Understand complex architectures, technologies, and features",
    prompt:
      "Can you analyze the top recommended solutions and their core technology stacks?",
  },
  {
    icon: Lightbulb,
    title: "Generate insights",
    description: "Get structured answers, key comparisons, and recommendations",
    prompt:
      "Which solutions best support AI workflow orchestration and microservices?",
  },
  {
    icon: HelpCircle,
    title: "Get assistance",
    description:
      "Ask questions about your workspace, workflows, and integrations",
    prompt:
      "How can I filter and locate specific solutions by category and tags?",
  },
];

export function ChatWelcome({
  onSelectPrompt,
  className,
  compact = false,
}: ChatWelcomeProps) {
  return (
    <div
      className={cn(
        "my-auto flex w-full flex-col items-center justify-center text-center @container",
        compact ? "max-w-sm p-4 py-2" : "max-w-3xl p-4 sm:p-6",
        className,
      )}
    >
      <div
        className={cn(
          "space-y-1",
          compact ? "max-w-xs" : "max-w-md space-y-1.5",
        )}
      >
        <h1
          className={cn(
            "font-semibold tracking-tight",
            compact ? "text-lg" : "text-xl sm:text-2xl",
          )}
        >
          What can I help you with?
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask anything about your solutions, documents, or workflows.
        </p>
      </div>

      <div
        className={cn(
          "w-full grid-cols-1 gap-2",
          compact
            ? "mt-4 grid max-w-sm"
            : "mt-6 grid max-w-2xl gap-3 @sm:grid-cols-2",
        )}
      >
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border bg-card text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                compact ? "p-3" : "p-3.5",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "text-muted-foreground",
                    compact ? "size-4" : "size-4",
                  )}
                />
                <span className="text-xs font-medium sm:text-sm">
                  {item.title}
                </span>
              </div>
              <p
                className={cn(
                  "line-clamp-2 text-xs text-muted-foreground",
                  compact && "text-[11px]",
                )}
              >
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
