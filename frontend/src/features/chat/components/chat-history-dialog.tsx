import { useState } from "react";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { ChatHistoryItem } from "./chat-history-item";
import { ChatEmptyState } from "./chat-empty-state";

import { useChatHistory } from "../hooks/use-chat-history";
import type { Conversation } from "../types/chat.types";

export interface ChatHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ChatHistoryDialog({
  open,
  onOpenChange,
  activeConversationId,
  onSelectConversation,
}: ChatHistoryDialogProps) {
  const {
    groupedConversations,
    searchQuery,
    setSearchQuery,
    isLoading,
    renameConversation,
    deleteConversation,
    allConversations,
  } = useChatHistory();

  const [deletingConversation, setDeletingConversation] =
    useState<Conversation | null>(null);

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onOpenChange(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingConversation) return;

    try {
      await deleteConversation(deletingConversation.id);
    } finally {
      setDeletingConversation(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl!">
          <DialogHeader>
            <DialogTitle>Chat history</DialogTitle>
          </DialogHeader>

          {/* Search conversations */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9"
            />
          </div>

          {/* Conversation list */}
          <ScrollArea className="max-h-[60vh] pr-3">
            {isLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="mt-4 h-4 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ) : allConversations.length === 0 ? (
              <ChatEmptyState
                title="No conversations yet"
                description="Start a chat to see your conversation history here."
              />
            ) : groupedConversations.length === 0 ? (
              <ChatEmptyState
                title="No matching conversations"
                description={`No conversations match "${searchQuery}".`}
              />
            ) : (
              <div className="space-y-4 py-1">
                {groupedConversations.map(({ group, items }) => (
                  <div key={group} className="space-y-1">
                    <div className="select-none px-2 text-xs text-muted-foreground">
                      {group}
                    </div>

                    <div className="space-y-0.5">
                      {items.map((conv) => (
                        <ChatHistoryItem
                          key={conv.id}
                          conversation={conv}
                          isActive={conv.id === activeConversationId}
                          onSelect={() => handleSelect(conv.id)}
                          onRename={renameConversation}
                          onDeleteRequest={(conversation) =>
                            setDeletingConversation(conversation)
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deletingConversation)}
        onOpenChange={(isOpen) => !isOpen && setDeletingConversation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete &ldquo;
              {deletingConversation?.title}
              &rdquo; and its entire message history. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
