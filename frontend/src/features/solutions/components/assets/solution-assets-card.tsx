import type { SolutionAsset } from "@/types/solution-asset.types";
import type { SolutionDocument, SolutionVideo } from "@/types/solution.types";
import { normalizeSolutionAssets } from "@/utils/asset-utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderGit2 } from "lucide-react";
import { SolutionAssetList } from "./solution-asset-list";
import { SolutionFullscreenViewer } from "./fullscreen-viewer";
import { Badge } from "@/components/ui/badge";
import { useCallback, useMemo, useState } from "react";

export interface SolutionAssetsCardProps {
  assets?: SolutionAsset[];
  documents?: SolutionDocument[];
  videos?: SolutionVideo[];
  layout?: "hybrid" | "grid";
  title?: string;
  description?: string;
  className?: string;
}

export function SolutionAssetsCard({
  assets: propAssets,
  documents,
  videos,
  layout = "hybrid",
  title = "Solution Assets & Media",
  description = "Documents, diagrams, specifications, and demo videos.",
  className,
}: SolutionAssetsCardProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const assets = useMemo(() => {
    if (propAssets?.length) return propAssets;
    return normalizeSolutionAssets(documents, videos);
  }, [propAssets, documents, videos]);

  const handlePreview = useCallback(
    (asset: SolutionAsset) => {
      const index = assets.findIndex(
        (a) => a.id === asset.id || a.file_url === asset.file_url,
      );
      setPreviewIndex(index >= 0 ? index : 0);
    },
    [assets],
  );

  if (!assets.length) return null;

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderGit2 className="size-4 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>

          <CardAction>
            <Badge variant="secondary">
              {assets.length} {assets.length === 1 ? "item" : "items"}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent>
          <SolutionAssetList
            assets={assets}
            layout={layout}
            onPreview={handlePreview}
          />
        </CardContent>
      </Card>

      <SolutionFullscreenViewer
        open={previewIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewIndex(null);
        }}
        assets={assets}
        initialIndex={previewIndex ?? 0}
      />
    </>
  );
}
