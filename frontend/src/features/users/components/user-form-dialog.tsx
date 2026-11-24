import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { useUserForm } from "../hooks/use-user-form";
import type { User } from "@/types/user.types";
import { BRAND_CONFIG } from "@/config/brand.config";
import { Loader2 } from "lucide-react";

export interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: User | null;
}

interface UserFormContentProps {
  userToEdit?: User | null;
  onClose: () => void;
}

function UserFormContent({ userToEdit, onClose }: UserFormContentProps) {
  const { register, handleSubmit, errors, isPending, isEdit } = useUserForm({
    userToEdit,
    onSuccess: onClose,
  });

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit User" : "Create New User"}</DialogTitle>

        <DialogDescription>
          {isEdit
            ? "Update user account information and credentials."
            : `Add a new user with system access to ${BRAND_CONFIG.fullName}.`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <Field>
          <Label htmlFor="username">Username</Label>

          <Input
            id="username"
            placeholder="e.g. jdoe"
            disabled={isPending}
            aria-invalid={Boolean(errors.username)}
            {...register("username")}
          />

          {errors.username && (
            <FieldError>{errors.username.message}</FieldError>
          )}
        </Field>

        <Field>
          <Label htmlFor="email">Email Address</Label>

          <Input
            id="email"
            type="email"
            placeholder="name@thoughtminds.ai"
            disabled={isPending}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />

          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field>
          <Label htmlFor="password">
            {isEdit ? "New Password" : "Password"}
          </Label>

          <PasswordInput
            id="password"
            placeholder={
              isEdit
                ? "Leave blank to keep current password"
                : "Min. 6 characters"
            }
            disabled={isPending}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />

          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>

        <Field>
          <Label htmlFor="confirmPassword">
            {isEdit ? "Confirm New Password" : "Confirm Password"}
          </Label>

          <PasswordInput
            id="confirmPassword"
            placeholder={isEdit ? "Confirm new password" : "Re-enter password"}
            disabled={isPending}
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />

          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          )}
        </Field>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}

          {isEdit ? "Save Changes" : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserFormDialog({
  open,
  onOpenChange,
  userToEdit,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <UserFormContent
            key={userToEdit?.id ?? "new"}
            userToEdit={userToEdit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
