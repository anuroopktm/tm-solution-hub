import * as React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMediaType } from "@/utils/media";
import { SolutionCardFallback } from "./solution-card-fallback";
import type { Solution } from "@/types/solution.types";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export function SolutionCard({ solution, onClick }: SolutionCardProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Resolve thumbnail and preview URLs (with fallback to first demo video if top-level fields are unset)
  const thumbnailUrl =
    solution.thumbnail_url || solution.videos?.[0]?.thumbnail_url;
  const previewUrl = solution.preview_url || solution.videos?.[0]?.video_url;

  const mediaType = getMediaType(previewUrl);

  const handleMouseEnter = () => {
    if (mediaType === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Safe catch for autoplay constraints
      });
    }
  };

  const handleMouseLeave = () => {
    if (mediaType === "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Card
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="shine-card group/card cursor-pointer pt-0"
    >
      {/* Media Container (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/60">
        {mediaType === "video" && previewUrl ? (
          <video
            ref={videoRef}
            src={previewUrl}
            poster={thumbnailUrl || undefined}
            muted
            loop
            playsInline
            preload="none"
            className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        ) : (
          /* Animated Conforge Brand SVG Banner (like Category) */
          <SolutionCardFallback />
        )}

        {/* Subtle Dark Overlay on Hover for Contrast */}
        <div className="pointer-events-none absolute inset-0 bg-black/15 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100" />
      </div>

      {/* Card Content */}
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base leading-snug transition-colors group-hover/card:text-primary">
          {solution.title}
        </CardTitle>

        <CardDescription className="line-clamp-3 leading-relaxed">
          {solution.description || "No description provided."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
