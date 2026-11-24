import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { getMediaType } from "@/utils/media";
import { SolutionCardFallback } from "../solution-card-fallback";
import { SolutionFullscreenViewer } from "../assets/fullscreen-viewer";
import { Maximize2 } from "lucide-react";
import type { Solution } from "@/types/solution.types";
import type { SolutionAsset } from "@/types/solution-asset.types";

interface SolutionMediaHeroProps {
  solution: Solution;
}

export function SolutionMediaHero({ solution }: SolutionMediaHeroProps) {
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);

  const thumbnailUrl =
    solution.thumbnail_url || solution.videos?.[0]?.thumbnail_url;
  const previewUrl = solution.preview_url || solution.videos?.[0]?.video_url;

  const mediaType = getMediaType(previewUrl);

  const heroAssets = useMemo<SolutionAsset[]>(() => {
    const list: SolutionAsset[] = [];
    if (previewUrl) {
      list.push({
        id: "hero-preview",
        name: `${solution.title} Preview`,
        type: mediaType === "video" ? "video" : "image",
        format: mediaType === "video" ? "MP4" : "IMAGE",
        file_url: previewUrl,
        thumbnail_url: thumbnailUrl || undefined,
        description: solution.description,
      });
    } else if (thumbnailUrl) {
      list.push({
        id: "hero-thumbnail",
        name: `${solution.title} Thumbnail`,
        type: "image",
        format: "IMAGE",
        file_url: thumbnailUrl,
        description: solution.description,
      });
    }

    // Include other solution videos if present
    solution.videos?.forEach((v, idx) => {
      if (v.video_url && v.video_url !== previewUrl) {
        list.push({
          id: v.id || `video-${idx}`,
          name: v.title || `Video ${idx + 1}`,
          type: "video",
          format: "MP4",
          file_url: v.video_url,
          thumbnail_url: v.thumbnail_url || undefined,
          duration_seconds: v.duration_seconds,
        });
      }
    });

    return list;
  }, [previewUrl, thumbnailUrl, solution, mediaType]);

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-card p-0 shadow-xs">
        <div className="relative aspect-21/9 sm:aspect-2.5/1 max-h-80 w-full overflow-hidden bg-muted/50">
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
              onClick={() => setViewerOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setViewerOpen(true);
                }
              }}
              title="Click to view full preview"
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

      <SolutionFullscreenViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        assets={heroAssets}
        initialIndex={0}
      />
    </>
  );
}
