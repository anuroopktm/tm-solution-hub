import type { SolutionVideo } from "@/types/solution.types";
import { SolutionAssetsCard } from "../assets";

interface SolutionVideosCardProps {
  videos: SolutionVideo[];
}

export function SolutionVideosCard({ videos }: SolutionVideosCardProps) {
  if (!videos || videos.length === 0) return null;

  return (
    <SolutionAssetsCard
      videos={videos}
      title="Video Demonstrations"
      description="End-to-end walkthroughs and platform demonstration recordings."
    />
  );
}
