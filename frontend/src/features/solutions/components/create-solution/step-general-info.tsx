import React, { useMemo } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";
import type { useCategories } from "@/hooks/use-categories";
import type { useUsers } from "@/hooks/use-users";

export interface StepGeneralInfoProps {
  register: UseFormRegister<SolutionCreateFormValues>;
  control: Control<SolutionCreateFormValues>;
  errors: FieldErrors<SolutionCreateFormValues>;
  isPending: boolean;
  categories: ReturnType<typeof useCategories>["data"];
  categoriesLoading: boolean;
  users: ReturnType<typeof useUsers>["data"];
  usersLoading: boolean;
  selectedCategoryIds: string[];
  toggleCategory: (categoryId: string) => void;
}

export function StepGeneralInfo({
  register,
  control,
  errors,
  isPending,
  categories,
  categoriesLoading,
  users,
  usersLoading,
  selectedCategoryIds,
  toggleCategory,
}: StepGeneralInfoProps) {
  const leadAnchor = useComboboxAnchor();

  const categoryNames = useMemo(
    () => (categories || []).map((c) => c.name),
    [categories],
  );

  const selectedCategoryNames = useMemo(
    () =>
      (categories || [])
        .filter((c) => selectedCategoryIds.includes(c.id))
        .map((c) => c.name),
    [categories, selectedCategoryIds],
  );

  const handleCategoryValueChange = (newNames: string[]) => {
    const currentNameSet = new Set(selectedCategoryNames);
    const newNameSet = new Set(newNames);

    for (const name of newNames) {
      if (!currentNameSet.has(name)) {
        const cat = (categories || []).find((c) => c.name === name);
        if (cat) toggleCategory(cat.id);
      }
    }

    for (const name of selectedCategoryNames) {
      if (!newNameSet.has(name)) {
        const cat = (categories || []).find((c) => c.name === name);
        if (cat) toggleCategory(cat.id);
      }
    }
  };

  const activeUsers = useMemo(
    () => (users || []).filter((u) => !u.is_deleted),
    [users],
  );

  const userNames = useMemo(
    () => activeUsers.map((u) => u.username),
    [activeUsers],
  );

  return (
    <Card key="step-0">
      <CardHeader>
        <CardTitle>General Information</CardTitle>
        <CardDescription>
          Basic metadata, domain categories, and technical ownership.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <Label htmlFor="solution-title">
            Solution Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="solution-title"
            placeholder="e.g. Enterprise RAG Knowledge Search Platform"
            aria-invalid={Boolean(errors.title)}
            disabled={isPending}
            {...register("title")}
          />
        </Field>

        <Field>
          <Label htmlFor="solution-description">
            Description & Scope <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="solution-description"
            placeholder="Summarize the business problem, solution architecture, and implementation details..."
            rows={4}
            disabled={isPending}
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
        </Field>

        <FieldGroup className="grid sm:grid-cols-2">
          <Field>
            <Label>
              Domain Categories <span className="text-destructive">*</span>
            </Label>
            {categoriesLoading ? (
              <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
            ) : (
              <MultiSelectCombobox
                options={categoryNames}
                value={selectedCategoryNames}
                onChange={handleCategoryValueChange}
                placeholder="Select categories..."
                aria-label="Domain categories"
                aria-invalid={Boolean(errors.category_ids)}
                disabled={isPending}
              />
            )}
          </Field>

          <Field>
            <Label>Technical Lead</Label>
            {usersLoading ? (
              <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
            ) : (
              <Controller
                name="lead_id"
                control={control}
                render={({ field }) => {
                  const selectedUser = activeUsers.find(
                    (user) => user.id === field.value,
                  );
                  const selectedLeadNames = selectedUser
                    ? [selectedUser.username]
                    : [];

                  const handleLeadValueChange = (newNames: string[]) => {
                    if (newNames.length === 0) {
                      field.onChange("");
                    } else {
                      const latestName = newNames[newNames.length - 1];
                      const matched = activeUsers.find(
                        (u) => u.username === latestName,
                      );
                      field.onChange(matched ? matched.id : "");
                    }
                  };

                  return (
                    <Combobox
                      multiple
                      autoHighlight
                      items={userNames}
                      value={selectedLeadNames}
                      onValueChange={handleLeadValueChange}
                      disabled={isPending}
                    >
                      <ComboboxChips ref={leadAnchor} className="w-full">
                        <ComboboxValue>
                          {(values) => (
                            <React.Fragment>
                              {values.map((value: string) => (
                                <ComboboxChip key={value}>{value}</ComboboxChip>
                              ))}
                              <ComboboxChipsInput
                                placeholder={
                                  values.length > 0
                                    ? ""
                                    : "Select technical lead..."
                                }
                              />
                            </React.Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={leadAnchor}>
                        <ComboboxEmpty>No team members found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  );
                }}
              />
            )}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
