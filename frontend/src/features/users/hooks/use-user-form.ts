import {
  useForm,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";
import {
  createUserSchema,
  updateUserSchema,
  type UserFormValues,
} from "@/schemas/user.schema";
import type { User, UserUpdatePayload } from "@/types/user.types";

export interface UseUserFormOptions {
  userToEdit?: User | null;
  onSuccess?: () => void;
}

export interface UseUserFormReturn {
  register: UseFormRegister<UserFormValues>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<UserFormValues>;
  isPending: boolean;
  isEdit: boolean;
  reset: () => void;
}

export function useUserForm({
  userToEdit,
  onSuccess,
}: UseUserFormOptions = {}): UseUserFormReturn {
  const isEdit = Boolean(userToEdit);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isPending =
    createUserMutation.isPending || updateUserMutation.isPending;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      username: userToEdit?.username ?? "",
      email: userToEdit?.email ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit && userToEdit) {
        const payload: UserUpdatePayload = {
          username: values.username.trim(),
          email: values.email.trim(),
        };

        if (values.password && values.password.trim()) {
          payload.password = values.password;
        }

        await updateUserMutation.mutateAsync({
          id: userToEdit.id,
          payload,
        });

        toast.success("User updated successfully");
      } else {
        await createUserMutation.mutateAsync({
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password ?? "",
        });

        toast.success("User created successfully");
      }

      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to save user";

      toast.error(errorMsg);
    }
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isPending,
    isEdit,
    reset: form.reset,
  };
}
