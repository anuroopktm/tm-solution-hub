export type SolutionAssetType = "document" | "image" | "video" | "other";

export interface SolutionAsset {
  id: string;
  name: string;
  description?: string | null;
  type: SolutionAssetType;
  format: string;
  file_url: string;
  file_size_bytes?: number | null;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
}

export interface AssetViewerProps {
  asset: SolutionAsset;
  className?: string;
}
