import { useState, type KeyboardEvent } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Conversation } from "../types/chat.types";

export interface ChatHistoryItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onSelect: () => void;
  onRename: (id: string, newTitle: string) => Promise<unknown> | void;
  onDeleteRequest: (conversation: Conversation) => void;
}

export function ChatHistoryItem({
  conversation,
  isActive = false,
  onSelect,
  onRename,
  onDeleteRequest,
}: ChatHistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const handleSaveRename = async () => {
    const trimmed = editTitle.trim();

    if (!trimmed) {
      setEditTitle(conversation.title);
      setIsEditing(false);
      return;
    }

    try {
      if (trimmed !== conversation.title) {
        await onRename(conversation.id, trimmed);
      }

      setIsEditing(false);
    } catch {
      // Keep the editing state open if renaming fails.
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSaveRename();
    } else if (e.key === "Escape") {
      setEditTitle(conversation.title);
      setIsEditing(false);
    }
  };

  const handleCancelRename = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 rounded-md border border-input p-1">
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Conversation title"
          className="h-8"
        />

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => void handleSaveRename()}
          aria-label="Save conversation title"
        >
          <Check />
        </Button>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={handleCancelRename}
          aria-label="Cancel renaming"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-md pr-1 transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? "page" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm"
      >
        <MessageSquare className="size-4 shrink-0 text-muted-foreground" />

        <span className="truncate">{conversation.title}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${conversation.title}`}
              className={cn(
                "shrink-0 text-muted-foreground",
                "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                "data-[state=open]:opacity-100",
              )}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setEditTitle(conversation.title);
              setIsEditing(true);
            }}
          >
            <Pencil />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onDeleteRequest(conversation)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
