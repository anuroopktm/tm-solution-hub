import { useRef, type ChangeEvent } from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUploadFile } from "@/hooks/use-storage";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";

export interface StepDeploymentsLinksProps {
  register: UseFormRegister<SolutionCreateFormValues>;
  setValue?: UseFormSetValue<SolutionCreateFormValues>;
  errors: FieldErrors<SolutionCreateFormValues>;
  isPending: boolean;
}

export function StepDeploymentsLinks({
  register,
  setValue,
  errors,
  isPending,
}: StepDeploymentsLinksProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFile();

  const handleThumbnailUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10 MB.");
      e.target.value = "";
      return;
    }

    e.target.value = "";

    toast.promise(uploadMutation.mutateAsync({ file, folder: "thumbnails" }), {
      loading: `Uploading ${file.name}...`,
      success: (data) => {
        if (setValue) {
          setValue("thumbnail_url", data.url, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
        return `Thumbnail "${file.name}" uploaded successfully!`;
      },
      error: (err: unknown) => {
        return err instanceof Error
          ? err.message
          : "Failed to upload thumbnail image.";
      },
    });
  };

  const isUploading = uploadMutation.isPending;

  return (
    <Card key="step-2">
      <CardHeader>
        <CardTitle>Deployments & Links</CardTitle>
        <CardDescription>
          External links, live preview, and thumbnail banner.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <Label htmlFor="repo-url">
            Repository URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="repo-url"
            type="url"
            placeholder="https://github.com/organization/repository"
            disabled={isPending}
            aria-invalid={Boolean(errors.repository_url)}
            {...register("repository_url")}
          />
        </Field>

        <Field>
          <Label htmlFor="preview-url">
            Live Preview / Documentation URL{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="preview-url"
            type="url"
            placeholder="https://demo.example.com"
            disabled={isPending}
            aria-invalid={Boolean(errors.preview_url)}
            {...register("preview_url")}
          />
        </Field>

        <Field>
          <Label htmlFor="thumbnail-url">
            Thumbnail / Banner Image URL{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="thumbnail-url"
              type="url"
              placeholder="https://images.example.com/banner.png or upload below"
              disabled={isPending || isUploading}
              aria-invalid={Boolean(errors.thumbnail_url)}
              {...register("thumbnail_url")}
            />
            {setValue && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isPending || isUploading}
                  onChange={handleThumbnailUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </>
            )}
          </div>
        </Field>
      </CardContent>
    </Card>
  );
}
