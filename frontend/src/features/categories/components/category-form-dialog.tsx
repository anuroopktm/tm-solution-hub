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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";

import { useCategoryForm } from "@/features/categories/hooks/use-category-form";
import { CategoryIcon } from "@/constants/category-icons";
import type { CategoryFormDialogProps } from "@/features/categories/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POPULAR_ICONS = [
  "Brain",
  "Cloud",
  "ShieldCheck",
  "Database",
  "Cpu",
  "Workflow",
  "Network",
  "Layers",
  "Boxes",
  "Sparkles",
  "BarChart3",
  "Orbit",
];

export function CategoryFormDialog({
  open,
  onOpenChange,
  categoryToEdit,
}: CategoryFormDialogProps) {
  const { register, handleSubmit, errors, watch, setValue, isPending, isEdit } =
    useCategoryForm({
      categoryToEdit,
      onSuccess: () => onOpenChange(false),
    });

  const selectedIcon = watch("icon");

  const handleIconSelect = (icon: string | null) => {
    setValue("icon", icon ?? "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit category" : "Create category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the category details."
              : "Add a new category to organize your solutions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <Label htmlFor="name">
              Category name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Artificial Intelligence"
              {...register("name")}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this category is about"
              rows={3}
              {...register("description")}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="icon">
              Icon <span className="text-destructive">*</span>
            </Label>

            <Select
              value={selectedIcon || null}
              onValueChange={handleIconSelect}
            >
              <SelectTrigger id="icon" className="w-full">
                <SelectValue placeholder="Select an Icon">
                  {(value: string | null) =>
                    value ? (
                      <span className="flex items-center gap-2">
                        <CategoryIcon name={value} className="size-4" />
                        {value}
                      </span>
                    ) : (
                      "Select an Icon"
                    )
                  }
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {POPULAR_ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <span className="flex items-center gap-2">
                      <CategoryIcon name={icon} className="size-4" />
                      {icon}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError>{errors.icon?.message}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="thumbnail_url">
              Thumbnail URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="thumbnail_url"
              placeholder="https://example.com/image.png"
              {...register("thumbnail_url")}
            />
            <FieldError>{errors.thumbnail_url?.message}</FieldError>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
