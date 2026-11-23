import * as React from "react";
import type { AssetViewerProps } from "@/types/solution-asset.types";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";

export function ImageViewer({ asset, className }: AssetViewerProps) {
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [rotation, setRotation] = React.useState<number>(0);
  const [hasError, setHasError] = React.useState<boolean>(false);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 25, 50));
  const handleReset = () => {
    setZoomLevel(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Zoom and Transform Controls */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2 text-xs">
        <span className="text-muted-foreground font-mono">
          {zoomLevel}% · {rotation}°
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleReset}
            title="Fit to Screen"
            aria-label="Fit to Screen"
          >
            <Maximize2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="size-3.5" />
          </Button>
          <div className="h-3 w-px bg-border/60 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleRotate}
            title="Rotate 90°"
            aria-label="Rotate 90°"
          >
            <RotateCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex-1 min-h-[360px] max-h-[65vh] overflow-auto bg-muted/40 p-4 flex items-center justify-center">
        {hasError ? (
          <div className="text-center p-6 text-muted-foreground text-sm">
            <p>Failed to load image preview.</p>
            <a
              href={asset.file_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline mt-2 inline-block text-xs"
            >
              Open in external window
            </a>
          </div>
        ) : (
          <div
            className="transition-transform duration-200 ease-out flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={asset.file_url}
              alt={asset.name}
              className={`max-h-[60vh] max-w-full rounded-md object-contain shadow-xs select-none ${className || ""}`}
              onError={() => setHasError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
