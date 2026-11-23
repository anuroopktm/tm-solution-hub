import type { SolutionAsset } from "@/types/solution-asset.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/formatters";
import { formatDuration } from "@/utils/asset-utils";
import { Download, ExternalLink } from "lucide-react";
import { AssetPreview } from "./viewers/asset-preview";

export interface SolutionAssetPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: SolutionAsset | null;
}

export function SolutionAssetPreviewDialog({
  open,
  onOpenChange,
  asset,
}: SolutionAssetPreviewDialogProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden sm:max-h-[90vh] flex flex-col">
        {/* Header Toolbar */}
        <DialogHeader className="border-b border-border/70 px-5 py-3.5 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 pr-8">
            <DialogTitle className="truncate text-base font-semibold">
              {asset.name}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-primary">
                {asset.format}
              </span>
              {asset.file_size_bytes ? (
                <span>• {formatFileSize(asset.file_size_bytes)}</span>
              ) : null}
              {asset.duration_seconds ? (
                <span>• {formatDuration(asset.duration_seconds)}</span>
              ) : null}
              {asset.description ? (
                <span className="truncate">• {asset.description}</span>
              ) : null}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 mr-8">
            <Button
              variant="outline"
              size="icon-sm"
              nativeButton={false}
              render={
                <a
                  href={asset.file_url}
                  download={asset.name}
                  target="_blank"
                  rel="noreferrer"
                  title="Download File"
                />
              }
            >
              <Download className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              nativeButton={false}
              render={
                <a
                  href={asset.file_url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open in New Tab"
                />
              }
            >
              <ExternalLink className="size-3.5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content Viewer */}
        <AssetPreview asset={asset} />
      </DialogContent>
    </Dialog>
  );
}
