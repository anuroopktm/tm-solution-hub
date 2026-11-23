import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/formatters";
import {
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  RotateCw,
} from "lucide-react";

export interface FilePreviewItem {
  name: string;
  url: string;
  format?: string;
  sizeBytes?: number | null;
  description?: string | null;
  isImage?: boolean;
}

export interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FilePreviewItem | null;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  file,
}: FilePreviewDialogProps) {
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [rotation, setRotation] = React.useState<number>(0);

  // Reset zoom and rotation whenever a new file opens
  React.useEffect(() => {
    if (open) {
      setZoomLevel(100);
      setRotation(0);
    }
  }, [open, file]);

  if (!file) return null;

  const isImage =
    file.isImage ??
    Boolean(
      file.url &&
      (/\.(png|jpe?g|webp|svg|gif|avif)($|\?)/i.test(file.url) ||
        file.url.startsWith("blob:") ||
        file.url.startsWith("data:image/") ||
        ["PNG", "JPG", "JPEG", "WEBP", "SVG", "GIF"].includes(
          (file.format || "").toUpperCase(),
        )),
    );

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden sm:max-h-[90vh] flex flex-col">
        {/* Header Toolbar */}
        <DialogHeader className="border-b border-border/70 px-5 py-3.5 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 pr-8">
            <DialogTitle className="truncate text-base font-semibold">
              {file.name}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs">
              {file.format && (
                <span className="font-semibold uppercase tracking-wider text-primary">
                  {file.format}
                </span>
              )}
              {file.sizeBytes ? (
                <span>• {formatFileSize(file.sizeBytes)}</span>
              ) : null}
              {file.description ? (
                <span className="truncate">• {file.description}</span>
              ) : null}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Main Canvas Viewport */}
        <div className="relative flex-1 min-h-[300px] max-h-[65vh] overflow-auto bg-muted/40 p-4 flex items-center justify-center">
          {isImage ? (
            <div
              className="transition-transform duration-200 ease-out flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={file.url}
                alt={file.name}
                className="max-h-[58vh] w-auto max-w-full rounded-md object-contain shadow-xs select-none"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="rounded-xl border border-border/70 bg-background p-4 shadow-xs">
                <FileText className="size-10 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Document preview not available inline
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                You can download the file or open it in a new window to view its
                full contents.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions & Zoom Toolbar */}
        <div className="border-t border-border/70 bg-card px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          {isImage ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="min-w-10 text-center text-xs font-medium text-muted-foreground">
                {zoomLevel}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleResetZoom}
                className="text-xs"
                title="Fit to screen"
              >
                <Maximize2 className="size-3 mr-1" />
                Fit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleRotate}
                aria-label="Rotate"
                title="Rotate 90 degrees"
              >
                <RotateCw className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              render={
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  download={file.name}
                />
              }
              className="gap-1.5 text-xs"
            >
              <Download className="size-3.5" />
              Download
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              render={<a href={file.url} target="_blank" rel="noreferrer" />}
              className="gap-1.5 text-xs"
            >
              <ExternalLink className="size-3.5" />
              Open In Tab
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
