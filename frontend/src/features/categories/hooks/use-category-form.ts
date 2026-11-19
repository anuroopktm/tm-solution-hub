import { useEffect } from "react";
import {
  useForm,
  type UseFormRegister,
  type FieldErrors,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/schemas/category.schema";
import type { Category } from "@/types/category.types";

export interface UseCategoryFormOptions {
  categoryToEdit?: Category | null;
  onSuccess?: () => void;
}

export interface UseCategoryFormReturn {
  register: UseFormRegister<CategoryFormValues>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<CategoryFormValues>;
  setValue: UseFormSetValue<CategoryFormValues>;
  watch: UseFormWatch<CategoryFormValues>;
  isPending: boolean;
  isEdit: boolean;
  reset: () => void;
}

export function useCategoryForm({
  categoryToEdit,
  onSuccess,
}: UseCategoryFormOptions = {}): UseCategoryFormReturn {
  const isEdit = Boolean(categoryToEdit);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const isPending =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: categoryToEdit?.name ?? "",
      description: categoryToEdit?.description ?? "",
      icon: categoryToEdit?.icon ?? "",
      thumbnail_url: categoryToEdit?.thumbnail_url ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: categoryToEdit?.name ?? "",
      description: categoryToEdit?.description ?? "",
      icon: categoryToEdit?.icon ?? "",
      thumbnail_url: categoryToEdit?.thumbnail_url ?? "",
    });
  }, [categoryToEdit, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        icon: values.icon.trim(),
        thumbnail_url: values.thumbnail_url.trim(),
      };

      if (isEdit && categoryToEdit) {
        await updateCategoryMutation.mutateAsync({
          id: categoryToEdit.id,
          payload,
        });
        toast.success("Category updated successfully");
      } else {
        await createCategoryMutation.mutateAsync(payload);
        toast.success("Category created successfully");
      }

      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to save category";

      toast.error(errorMsg);
    }
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    setValue: form.setValue,
    watch: form.watch,
    isPending,
    isEdit,
    reset: form.reset,
  };
}
