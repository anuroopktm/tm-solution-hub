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
      <AttachmentGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 overflow-visible snap-none py-0 *:data-[slot=attachment]:w-full! **:data-[slot=attachment]:w-full! **:data-[slot=attachment-media]:aspect-video! [&_[data-slot=attachment-media]_img]:aspect-video! [&_[data-slot=attachment-media]_img]:h-full! [&_[data-slot=attachment-media]_img]:w-full! [&_[data-slot=attachment-media]_img]:object-cover!">
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
    <div className="space-y-6">
      {mediaAssets.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Media, Architecture & Demos
          </h4>
          <AttachmentGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 overflow-visible snap-none py-0 *:data-[slot=attachment]:w-full! **:data-[slot=attachment]:w-full! **:data-[slot=attachment-media]:aspect-video! [&_[data-slot=attachment-media]_img]:aspect-video! [&_[data-slot=attachment-media]_img]:h-full! [&_[data-slot=attachment-media]_img]:w-full! [&_[data-slot=attachment-media]_img]:object-cover!">
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
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documents & Files
          </h4>
          <AttachmentGroup className="flex flex-col gap-2 overflow-visible snap-none py-0 *:data-[slot=attachment]:w-full! **:data-[slot=attachment]:w-full! *:data-[slot=attachment]:flex-nowrap! **:data-[slot=attachment]:flex-nowrap!">
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
