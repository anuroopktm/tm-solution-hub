import * as React from "react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { useUserForm } from "../hooks/use-user-form";
import type { User } from "@/types/user.types";
import { BRAND_CONFIG } from "@/config/brand.config";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

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

          <InputGroup>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={
                isEdit
                  ? "Leave blank to keep current password"
                  : "Min. 6 characters"
              }
              disabled={isPending}
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
                tabIndex={-1}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>

        <Field>
          <Label htmlFor="confirmPassword">
            {isEdit ? "Confirm New Password" : "Confirm Password"}
          </Label>

          <InputGroup>
            <InputGroupInput
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={
                isEdit ? "Confirm new password" : "Re-enter password"
              }
              disabled={isPending}
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isPending}
                tabIndex={-1}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

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
