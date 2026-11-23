import { MessageSquareDashed } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export interface ChatEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ChatEmptyState({
  title = "No conversations found",
  description = "Start a new chat to begin exploring solutions.",
  className,
}: ChatEmptyStateProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageSquareDashed />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
