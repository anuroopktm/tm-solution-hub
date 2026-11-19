import { useState } from "react";

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

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Label } from "@/components/ui/label";

import { toast } from "sonner";

import { useDeleteUser, useHardDeleteUser } from "@/hooks/use-users";

import type { User } from "@/types/user.types";

export interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  mode?: "soft" | "permanent";
  [key: string]: unknown;
}

interface UserDeleteContentProps {
  user: User;
  initialMode: "soft" | "permanent";
  onOpenChange: (open: boolean) => void;
}

function UserDeleteContent({
  user,
  initialMode,
  onOpenChange,
}: UserDeleteContentProps) {
  const [deleteMode, setDeleteMode] = useState<"soft" | "permanent">(
    initialMode,
  );

  const deleteMutation = useDeleteUser();
  const hardDeleteMutation = useHardDeleteUser();

  const isPending = deleteMutation.isPending || hardDeleteMutation.isPending;

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      if (deleteMode === "permanent") {
        await hardDeleteMutation.mutateAsync(user.id);
        toast.success(`User ${user.username} was permanently deleted`);
      } else {
        await deleteMutation.mutateAsync(user.id);
        toast.success(`User ${user.username} has been deactivated`);
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Action failed";

      toast.error(errorMsg);
    }
  };

  return (
    <AlertDialogContent className="max-w-md!">
      <AlertDialogHeader>
        <AlertDialogTitle>Delete User</AlertDialogTitle>

        <AlertDialogDescription>
          Choose how you want to remove{" "}
          <strong className="text-foreground">{user.username}</strong> (
          <strong className="text-foreground">{user.email}</strong>).
        </AlertDialogDescription>
      </AlertDialogHeader>

      <RadioGroup
        value={deleteMode}
        onValueChange={(value) => setDeleteMode(value as "soft" | "permanent")}
        disabled={isPending}
      >
        <div className="flex items-start gap-3">
          <RadioGroupItem value="soft" id="soft-delete" />

          <div>
            <Label htmlFor="soft-delete">Deactivate User</Label>

            <p className="text-sm text-muted-foreground">
              Temporarily remove system access. The user can be restored later.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <RadioGroupItem value="permanent" id="permanent-delete" />

          <div>
            <Label htmlFor="permanent-delete">Permanently Delete User</Label>

            <p className="text-sm text-muted-foreground">
              Permanently remove the user and their account. This action cannot
              be undone.
            </p>
          </div>
        </div>
      </RadioGroup>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

        <AlertDialogAction
          variant="destructive"
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? "Processing..." : "Confirm"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  user,
  mode = "soft",
}: UserDeleteDialogProps) {
  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <UserDeleteContent
          key={`${user.id}-${mode}`}
          user={user}
          initialMode={mode}
          onOpenChange={onOpenChange}
        />
      )}
    </AlertDialog>
  );
}
