import { Plus } from "lucide-react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StepAssetsDocumentCard } from "./step-assets-document-card";
import { StepAssetsVideoCard } from "./step-assets-video-card";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";

export interface StepAssetsMediaProps {
  register: UseFormRegister<SolutionCreateFormValues>;
  setValue?: UseFormSetValue<SolutionCreateFormValues>;
  watch?: UseFormWatch<SolutionCreateFormValues>;
  errors?: FieldErrors<SolutionCreateFormValues>;
  isPending: boolean;
  documentsList: Array<{
    id: string;
    name?: string;
    format?: string;
    file_url?: string;
    description?: string;
    file_size_bytes?: number;
  }>;
  videosList: Array<{
    id: string;
    title?: string;
    video_url?: string;
    description?: string;
  }>;
  appendDocument: (doc?: {
    name?: string;
    format?: string;
    file_url?: string;
    description?: string;
    file_size_bytes?: number;
  }) => void;
  removeDocument: (index: number) => void;
  appendVideo: (video?: {
    title?: string;
    video_url?: string;
    description?: string;
  }) => void;
  removeVideo: (index: number) => void;
}

export function StepAssetsMedia({
  register,
  setValue,
  watch,
  errors,
  isPending,
  documentsList,
  videosList,
  appendDocument,
  removeDocument,
  appendVideo,
  removeVideo,
}: StepAssetsMediaProps) {
  return (
    <Card key="step-3">
      <CardHeader>
        <CardTitle>Assets & Media</CardTitle>
        <CardDescription>
          Supplementary architecture diagrams, technical documentation, and
          demonstration videos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* SECTION 1: Documents & Specifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">
                Documents & Architecture Blueprints
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Attach PDFs, diagrams, or technical design specifications.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendDocument({
                  name: "",
                  format: "DOCUMENT",
                  file_url: "",
                  description: "",
                  file_size_bytes: 0,
                })
              }
              disabled={isPending}
              className="gap-1 text-xs"
            >
              <Plus className="size-3.5" />
              <span>Add Document</span>
            </Button>
          </div>

          {documentsList.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
              No documents added yet. Click &quot;+ Add Document&quot; to attach
              system diagrams or documentation.
            </div>
          ) : (
            <div className="space-y-4">
              {documentsList.map((doc, idx) => (
                <StepAssetsDocumentCard
                  key={doc.id}
                  index={idx}
                  docId={doc.id}
                  initialDoc={doc}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                  isPending={isPending}
                  onRemove={() => removeDocument(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: Demonstration Videos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">
                Demonstration Videos
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add video links demonstrating key capabilities or recorded
                walkthroughs.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendVideo({
                  title: "",
                  video_url: "",
                  description: "",
                })
              }
              disabled={isPending}
              className="gap-1 text-xs"
            >
              <Plus className="size-3.5" />
              <span>Add Video</span>
            </Button>
          </div>

          {videosList.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
              No videos added yet. Click &quot;+ Add Video&quot; to link Loom,
              YouTube, or recorded demonstrations.
            </div>
          ) : (
            <div className="space-y-4">
              {videosList.map((video, idx) => (
                <StepAssetsVideoCard
                  key={video.id}
                  index={idx}
                  videoId={video.id}
                  register={register}
                  errors={errors}
                  isPending={isPending}
                  onRemove={() => removeVideo(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
