import { useState } from "react";
import { Card } from "@/components/ui/card";
import { getMediaType } from "@/utils/media";
import { SolutionCardFallback } from "../solution-card-fallback";
import {
  FilePreviewDialog,
  type FilePreviewItem,
} from "@/components/ui/file-preview-dialog";
import { Maximize2 } from "lucide-react";
import type { Solution } from "@/types/solution.types";

interface SolutionMediaHeroProps {
  solution: Solution;
}

export function SolutionMediaHero({ solution }: SolutionMediaHeroProps) {
  const [previewFile, setPreviewFile] = useState<FilePreviewItem | null>(null);

  const thumbnailUrl =
    solution.thumbnail_url || solution.videos?.[0]?.thumbnail_url;
  const previewUrl = solution.preview_url || solution.videos?.[0]?.video_url;

  const mediaType = getMediaType(previewUrl);

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-card p-0 shadow-xs">
        <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full overflow-hidden bg-muted/50">
          {mediaType === "video" && previewUrl ? (
            <video
              src={previewUrl}
              poster={thumbnailUrl || undefined}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : thumbnailUrl ? (
            <div
              className="group/hero relative h-full w-full cursor-pointer"
              onClick={() =>
                setPreviewFile({
                  name: solution.title,
                  url: thumbnailUrl,
                  format: "IMAGE",
                  description: "Full-page resolution preview",
                  isImage: true,
                })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPreviewFile({
                    name: solution.title,
                    url: thumbnailUrl,
                    format: "IMAGE",
                    description: "Full-page resolution preview",
                    isImage: true,
                  });
                }
              }}
              title="Click to view full image"
            >
              <img
                src={thumbnailUrl}
                alt={solution.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground opacity-0 shadow-xs backdrop-blur-xs transition-opacity group-hover/hero:opacity-100">
                <Maximize2 className="size-3.5" />
                <span>Full Preview</span>
              </div>
            </div>
          ) : (
            <SolutionCardFallback />
          )}
        </div>
      </Card>

      <FilePreviewDialog
        open={Boolean(previewFile)}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        file={previewFile}
      />
    </>
  );
}
