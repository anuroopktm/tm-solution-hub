import { Trash2, Video as VideoIcon } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
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
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";

export interface StepAssetsVideoCardProps {
  index: number;
  videoId: string;
  register: UseFormRegister<SolutionCreateFormValues>;
  errors?: FieldErrors<SolutionCreateFormValues>;
  isPending: boolean;
  onRemove: () => void;
}

export function StepAssetsVideoCard({
  index,
  videoId,
  register,
  errors,
  isPending,
  onRemove,
}: StepAssetsVideoCardProps) {
  return (
    <Card key={videoId} className="border bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <VideoIcon className="size-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Video #{index + 1}
          </CardTitle>
        </div>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            disabled={isPending}
            aria-label={`Remove Video ${index + 1}`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field>
            <Label htmlFor={`video-title-${index}`}>
              Video Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`video-title-${index}`}
              placeholder="e.g. Platform Architecture Demo"
              disabled={isPending}
              aria-invalid={Boolean(errors?.videos?.[index]?.title)}
              {...register(`videos.${index}.title` as const)}
            />
            {errors?.videos?.[index]?.title && (
              <FieldError>{errors.videos[index]?.title?.message}</FieldError>
            )}
          </Field>

          <Field>
            <Label htmlFor={`video-url-${index}`}>
              Video URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`video-url-${index}`}
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://loom.com/..."
              disabled={isPending}
              aria-invalid={Boolean(errors?.videos?.[index]?.video_url)}
              {...register(`videos.${index}.video_url` as const)}
            />
            {errors?.videos?.[index]?.video_url && (
              <FieldError>
                {errors.videos[index]?.video_url?.message}
              </FieldError>
            )}
          </Field>
        </div>

        <Field>
          <Label htmlFor={`video-desc-${index}`}>Description</Label>
          <Input
            id={`video-desc-${index}`}
            placeholder="e.g. End-to-end user journey walkthrough"
            disabled={isPending}
            {...register(`videos.${index}.description` as const)}
          />
        </Field>
      </CardContent>
    </Card>
  );
}
