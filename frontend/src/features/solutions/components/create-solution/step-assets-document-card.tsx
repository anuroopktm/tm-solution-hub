import { useRef, type ChangeEvent } from "react";
import { Trash2, Upload, Loader2, FileText, ExternalLink } from "lucide-react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUploadFile } from "@/hooks/use-storage";
import { formatFileSize } from "@/utils/formatters";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";

export interface StepAssetsDocumentCardProps {
  index: number;
  docId: string;
  initialDoc?: {
    name?: string;
    format?: string;
    file_url?: string;
    description?: string;
    file_size_bytes?: number;
  };
  register: UseFormRegister<SolutionCreateFormValues>;
  setValue?: UseFormSetValue<SolutionCreateFormValues>;
  watch?: UseFormWatch<SolutionCreateFormValues>;
  errors?: FieldErrors<SolutionCreateFormValues>;
  isPending: boolean;
  onRemove: () => void;
}

export function StepAssetsDocumentCard({
  index,
  docId,
  initialDoc,
  register,
  setValue,
  watch,
  errors,
  isPending,
  onRemove,
}: StepAssetsDocumentCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useUploadFile();

  const fileUrl = watch
    ? watch(`documents.${index}.file_url`)
    : initialDoc?.file_url;
  const fileFormat = watch
    ? watch(`documents.${index}.format`)
    : initialDoc?.format;
  const fileSize = watch
    ? watch(`documents.${index}.file_size_bytes`)
    : initialDoc?.file_size_bytes;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50 MB.");
      e.target.value = "";
      return;
    }

    const format = file.name.split(".").pop()?.toUpperCase() || "DOCUMENT";
    const currentName = watch ? watch(`documents.${index}.name`) : "";
    e.target.value = "";

    toast.promise(uploadMutation.mutateAsync({ file, folder: "documents" }), {
      loading: `Uploading ${file.name}...`,
      success: (data) => {
        if (setValue) {
          setValue(`documents.${index}.file_url`, data.url, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue(`documents.${index}.format`, format, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue(`documents.${index}.file_size_bytes`, data.file_size_bytes, {
            shouldValidate: true,
            shouldDirty: true,
          });
          if (!currentName || !currentName.trim()) {
            setValue(
              `documents.${index}.name`,
              file.name.replace(/\.[^/.]+$/, ""),
              { shouldValidate: true, shouldDirty: true },
            );
          }
        }
        return `Uploaded "${file.name}" successfully!`;
      },
      error: (err: unknown) => {
        return err instanceof Error
          ? err.message
          : "Failed to upload document.";
      },
    });
  };

  return (
    <Card key={docId} className="border bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Document #{index + 1}
          </CardTitle>
        </div>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            disabled={isPending}
            aria-label={`Remove Document ${index + 1}`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field>
            <Label htmlFor={`doc-name-${index}`}>
              Document Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`doc-name-${index}`}
              placeholder="e.g. Architecture Overview Spec"
              disabled={isPending}
              aria-invalid={Boolean(errors?.documents?.[index]?.name)}
              {...register(`documents.${index}.name` as const)}
            />
            {errors?.documents?.[index]?.name && (
              <FieldError>{errors.documents[index]?.name?.message}</FieldError>
            )}
          </Field>

          <Field>
            <Label htmlFor={`doc-desc-${index}`}>Description / Type</Label>
            <Input
              id={`doc-desc-${index}`}
              placeholder="e.g. Architecture Diagram, Tech Spec"
              disabled={isPending}
              {...register(`documents.${index}.description` as const)}
            />
          </Field>
        </div>

        {/* File Upload Section */}
        <Field>
          <Label>
            Attached File <span className="text-destructive">*</span>
          </Label>
          <input
            type="hidden"
            {...register(`documents.${index}.file_url` as const)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.docx,.pptx,.xlsx"
            className="hidden"
            disabled={isPending || uploadMutation.isPending}
            onChange={handleFileUpload}
          />

          {fileUrl ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-2.5 text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  {fileFormat || "FILE"}
                </span>
                <span className="truncate text-xs font-medium text-foreground">
                  {fileUrl.split("/").pop() || "Uploaded File"}
                </span>
                {Boolean(fileSize) && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    ({formatFileSize(fileSize!)})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <span>View</span>
                  <ExternalLink className="size-3" />
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isPending || uploadMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground transition-colors hover:bg-muted/40"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Upload className="size-4 text-muted-foreground" />
              )}
              <span>
                {uploadMutation.isPending
                  ? "Uploading to storage..."
                  : "Click to select and upload document (PDF, PNG, JPG up to 50MB)"}
              </span>
            </div>
          )}
          {errors?.documents?.[index]?.file_url && (
            <FieldError>
              {errors.documents[index]?.file_url?.message}
            </FieldError>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}
