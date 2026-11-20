import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import type { FieldErrors } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";

export const STEP_VALIDATION_FIELDS: Record<
  number,
  (keyof SolutionCreateFormValues)[]
> = {
  0: ["title", "description", "category_ids"],
  1: ["tech_stack", "key_capabilities"],
  2: ["repository_url", "preview_url", "thumbnail_url"],
  3: ["documents", "videos"],
};

/**
 * Deeply extracts and deduplicates error messages from react-hook-form errors,
 * including root messages, nested object messages, and array item messages.
 * Only extracts human-readable messages from `.message`, ignoring internal
 * validation codes (such as `type: "too_small"`).
 */
export function extractErrorMessages(error: unknown): string[] {
  if (!error) return [];
  const messages: string[] = [];

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;

    const obj = node as Record<string, any>;

    // In React Hook Form / Zod, user-facing error messages are stored in `.message`
    if (typeof obj.message === "string" && obj.message.trim()) {
      const msg = obj.message.trim();
      if (!messages.includes(msg)) {
        messages.push(msg);
      }
    }

    // Root errors on array fields (e.g. errors.key_capabilities.root)
    if (obj.root && typeof obj.root === "object") {
      walk(obj.root);
    }

    // If it's an array of errors (e.g. errors.key_capabilities items), walk each item
    if (Array.isArray(obj)) {
      for (const item of obj) {
        walk(item);
      }
      return;
    }

    // Walk child field error objects, excluding internal RHF metadata (type, types, ref, root)
    for (const [key, val] of Object.entries(obj)) {
      if (
        key !== "ref" &&
        key !== "type" &&
        key !== "types" &&
        key !== "root" &&
        val &&
        typeof val === "object"
      ) {
        walk(val);
      }
    }
  };

  walk(error);
  return messages;
}

export interface SolutionFormValidationAlertProps {
  currentStep: number;
  errors: FieldErrors<SolutionCreateFormValues>;
}

export function SolutionFormValidationAlert({
  currentStep,
  errors,
}: SolutionFormValidationAlertProps) {
  const currentFieldErrors = useMemo(() => {
    const fields = STEP_VALIDATION_FIELDS[currentStep] ?? [];
    const list: string[] = [];

    for (const field of fields) {
      const err = (errors as Record<string, any>)[field];
      if (err) {
        const fieldMessages = extractErrorMessages(err);
        for (const msg of fieldMessages) {
          if (!list.includes(msg)) {
            list.push(msg);
          }
        }
      }
    }

    return list;
  }, [currentStep, errors]);

  if (currentFieldErrors.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Please resolve the following errors</AlertTitle>
      <AlertDescription>
        {currentFieldErrors.length === 1 ? (
          <p>{currentFieldErrors[0]}</p>
        ) : (
          <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
            {currentFieldErrors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
