import { Compass, FileSearch, Lightbulb, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatWelcomeProps {
  onSelectPrompt: (promptText: string) => void;
  className?: string;
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

export function ChatWelcome({ onSelectPrompt, className }: ChatWelcomeProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center p-6 text-center",
        className,
      )}
    >
      <div className="max-w-md space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          What can I help you with?
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask anything about your solutions, documents, or workflows.
        </p>
      </div>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="flex flex-col items-start gap-1 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{item.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
