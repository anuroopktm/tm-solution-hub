import type { ReactNode } from "react";
import { Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface ChatHeaderProps {
  title?: string;
  onNewChat: () => void;
  onOpenHistory: () => void;
  headerPrefix?: ReactNode;
}

export function ChatHeader({
  title = "New chat",
  onNewChat,
  onOpenHistory,
}: ChatHeaderProps) {
  const isNewChat = !title || title === "New chat";

  return (
    <PageHeader
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="gap-1.5"
          >
            <History className="size-3.5" />
            <span>History</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onNewChat}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>New chat</span>
          </Button>
        </div>
      }
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Chat</BreadcrumbPage>
          </BreadcrumbItem>
          {!isNewChat && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-xs truncate text-muted-foreground">
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </PageHeader>
  );
}
