import * as React from "react";
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
import { SolutionAssetPreviewDialog } from "./solution-asset-preview-dialog";
import { Badge } from "@/components/ui/badge";

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
  const [previewAsset, setPreviewAsset] = React.useState<SolutionAsset | null>(
    null,
  );

  const assets = React.useMemo(() => {
    if (propAssets?.length) return propAssets;
    return normalizeSolutionAssets(documents, videos);
  }, [propAssets, documents, videos]);

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
            onPreview={setPreviewAsset}
          />
        </CardContent>
      </Card>

      <SolutionAssetPreviewDialog
        open={Boolean(previewAsset)}
        onOpenChange={(open) => {
          if (!open) setPreviewAsset(null);
        }}
        asset={previewAsset}
      />
    </>
  );
}
