import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Video } from "lucide-react";
import { formatDuration } from "@/utils/formatters";
import type { SolutionVideo } from "@/types/solution.types";

interface SolutionVideosCardProps {
  videos: SolutionVideo[];
}

export function SolutionVideosCard({ videos }: SolutionVideosCardProps) {
  if (!videos || videos.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Video className="size-4 text-primary" />
          <span>Video Demonstrations</span>
        </CardTitle>
        <CardDescription>
          End-to-end extraction and platform walkthrough demos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {videos.map((vid) => (
            <a
              key={vid.id}
              href={vid.video_url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <h4 className="truncate text-sm font-medium text-foreground group-hover:underline">
                  {vid.title}
                </h4>
                {vid.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {vid.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2 text-muted-foreground ml-3">
                {vid.duration_seconds && (
                  <span className="text-xs">
                    {formatDuration(vid.duration_seconds)}
                  </span>
                )}
                <ExternalLink className="size-3.5 group-hover:text-foreground" />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
