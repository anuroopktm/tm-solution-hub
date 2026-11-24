import type { SolutionAsset } from "@/types/solution-asset.types";
import { formatFileSize } from "./utils/format-file-size";
import { formatDuration } from "@/utils/asset-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, ExternalLink, X } from "lucide-react";

export interface ViewerTopBarProps {
  asset: SolutionAsset | null;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
}

export function ViewerTopBar({
  asset,
  currentIndex,
  totalCount,
  onClose,
}: ViewerTopBarProps) {
  if (!asset) return null;

  return (
    <header
      role="banner"
      className="shrink-0 z-50 flex items-center justify-between gap-4 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/50 text-foreground transition-opacity duration-200"
    >
      {/* File metadata info */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-foreground truncate max-w-xs sm:max-w-md md:max-w-lg">
              {asset.name}
            </h2>
            {totalCount > 1 && (
              <Badge variant="outline">
                {currentIndex + 1} / {totalCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{asset.format}</Badge>
            {asset.file_size_bytes ? (
              <span>• {formatFileSize(asset.file_size_bytes)}</span>
            ) : null}
            {asset.duration_seconds ? (
              <span>• {formatDuration(asset.duration_seconds)}</span>
            ) : null}
            {asset.description ? (
              <span className="truncate hidden sm:inline">
                • {asset.description}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Top action shortcuts */}
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a
                    href={asset.file_url}
                    download={asset.name}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Download File"
                  />
                }
              >
                <Download />
              </Button>
            }
          />
          <TooltipContent>Download file</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a
                    href={asset.file_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open Original in New Tab"
                  />
                }
              >
                <ExternalLink />
              </Button>
            }
          />
          <TooltipContent>Open original in new tab</TooltipContent>
        </Tooltip>

        <Separator
          orientation="vertical"
          className="data-vertical:h-4 data-vertical:self-auto"
        />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive"
                aria-label="Close viewer"
              >
                <X />
              </Button>
            }
          />
          <TooltipContent>Close preview (Esc)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
