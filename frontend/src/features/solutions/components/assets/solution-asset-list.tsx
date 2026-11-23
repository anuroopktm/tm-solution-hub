import * as React from "react";
import type { SolutionAsset } from "@/types/solution-asset.types";
import { AttachmentGroup } from "@/components/ui/attachment";
import { SolutionAssetItem } from "./solution-asset-item";

export interface SolutionAssetListProps {
  assets: SolutionAsset[];
  layout?: "hybrid" | "grid";
  onPreview?: (asset: SolutionAsset) => void;
  renderActions?: (asset: SolutionAsset) => React.ReactNode;
}

export function SolutionAssetList({
  assets,
  layout = "hybrid",
  onPreview,
  renderActions,
}: SolutionAssetListProps) {
  if (!assets?.length) return null;

  if (layout === "grid") {
    return (
      <AttachmentGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {assets.map((asset) => (
          <SolutionAssetItem
            key={asset.id}
            asset={asset}
            orientation="vertical"
            onPreview={onPreview}
            renderActions={renderActions}
          />
        ))}
      </AttachmentGroup>
    );
  }

  const mediaAssets = assets.filter(
    (asset) => asset.type === "image" || asset.type === "video",
  );
  const documentAssets = assets.filter(
    (asset) => asset.type !== "image" && asset.type !== "video",
  );

  return (
    <div className="space-y-4">
      {mediaAssets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Media, Architecture & Demos
          </h4>
          <AttachmentGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {mediaAssets.map((asset) => (
              <SolutionAssetItem
                key={asset.id}
                asset={asset}
                orientation="vertical"
                onPreview={onPreview}
                renderActions={renderActions}
              />
            ))}
          </AttachmentGroup>
        </div>
      )}

      {documentAssets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documents & Files
          </h4>
          <AttachmentGroup className="flex flex-col gap-2">
            {documentAssets.map((asset) => (
              <SolutionAssetItem
                key={asset.id}
                asset={asset}
                orientation="horizontal"
                onPreview={onPreview}
                renderActions={renderActions}
              />
            ))}
          </AttachmentGroup>
        </div>
      )}
    </div>
  );
}
