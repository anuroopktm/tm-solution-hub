import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { SUGGESTED_TECH } from "@/features/solutions/constants/suggested-tech";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";

export interface StepTechCapabilitiesProps {
  register: UseFormRegister<SolutionCreateFormValues>;
  errors: FieldErrors<SolutionCreateFormValues>;
  isPending: boolean;
  watchedTech: string[];
  handleAddTech: (tech: string) => void;
  handleRemoveTech: (tech: string) => void;
  capabilitiesList: Array<{ id: string; name?: string; description?: string }>;
  appendCapability: (val: { name: string; description: string }) => void;
  removeCapability: (index: number) => void;
}

export function StepTechCapabilities({
  register,
  errors,
  isPending,
  watchedTech,
  handleAddTech,
  handleRemoveTech,
  capabilitiesList,
  appendCapability,
  removeCapability,
}: StepTechCapabilitiesProps) {
  const [availableTech, setAvailableTech] = useState<string[]>([
    ...SUGGESTED_TECH,
  ]);

  const handleTechChange = (newTechList: string[]) => {
    for (const t of newTechList) {
      if (!watchedTech.includes(t)) {
        handleAddTech(t);
      }
    }
    for (const t of watchedTech) {
      if (!newTechList.includes(t)) {
        handleRemoveTech(t);
      }
    }
  };

  const handleCreateTech = (newTech: string) => {
    if (!availableTech.includes(newTech)) {
      setAvailableTech((prev) => [...prev, newTech]);
    }
  };

  return (
    <Card key="step-1">
      <CardHeader>
        <CardTitle>Tech & Capabilities</CardTitle>
        <CardDescription>
          Core technologies used and key features of this solution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technologies & Frameworks */}
        <Field>
          <Label>
            Technologies & Frameworks{" "}
            <span className="text-destructive">*</span>
          </Label>
          <MultiSelectCombobox
            options={availableTech}
            value={watchedTech}
            onChange={handleTechChange}
            onCreate={handleCreateTech}
            placeholder="Select or add technologies..."
            aria-label="Technologies and Frameworks"
            aria-invalid={Boolean(errors.tech_stack)}
            disabled={isPending}
          />
        </Field>

        {/* Key Capabilities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>
                Key Capabilities <span className="text-destructive">*</span>
              </Label>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCapability({ name: "", description: "" })}
              disabled={isPending}
              className="gap-1 text-xs"
            >
              <Plus className="size-3.5" />
              <span>Add Feature</span>
            </Button>
          </div>

          {capabilitiesList.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
              No capabilities added yet. Click &quot;+ Add Feature&quot; to
              highlight key strengths.
            </div>
          ) : (
            <div className="space-y-3">
              {capabilitiesList.map((cap, idx) => (
                <Card key={cap.id}>
                  <CardHeader>
                    <CardTitle>Capability #{idx + 1}</CardTitle>
                    <CardAction>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeCapability(idx)}
                        disabled={isPending}
                        aria-label={`Remove Capability ${idx + 1}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Field>
                      <Label htmlFor={`cap-title-${idx}`}>
                        Capability Title{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`cap-title-${idx}`}
                        placeholder="e.g. Real-time Ingestion & Analytics"
                        disabled={isPending}
                        aria-label={`Capability ${idx + 1} Title`}
                        aria-invalid={Boolean(
                          errors.key_capabilities?.[idx]?.name,
                        )}
                        {...register(`key_capabilities.${idx}.name` as const)}
                      />
                    </Field>
                    <Field>
                      <Label htmlFor={`cap-desc-${idx}`}>
                        Capability Description{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id={`cap-desc-${idx}`}
                        placeholder="Describe functional strengths, performance benchmarks, or technical highlights..."
                        rows={2}
                        disabled={isPending}
                        aria-label={`Capability ${idx + 1} Description`}
                        aria-invalid={Boolean(
                          errors.key_capabilities?.[idx]?.description,
                        )}
                        {...register(
                          `key_capabilities.${idx}.description` as const,
                        )}
                      />
                    </Field>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
