import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import type {
  SolutionFullscreenViewerProps,
  ViewerControls,
} from "./types/viewer.types";
import { getPreviewType } from "./utils/get-preview-type";
import { useViewerNavigation } from "./hooks/use-viewer-navigation";
import { useViewerFullscreen } from "./hooks/use-viewer-fullscreen";
import { useViewerKeyboard } from "./hooks/use-viewer-keyboard";
import { ViewerTopBar } from "./viewer-top-bar";
import { ViewerBottomToolbar } from "./viewer-bottom-toolbar";
import { ViewerNavigation } from "./viewer-navigation";
import { ViewerLoading } from "./viewer-loading";
import { ViewerError } from "./viewer-error";

// Import Renderers
import { ImageViewer } from "./viewers/image-viewer";
import { PdfViewer } from "./viewers/pdf-viewer";
import { VideoViewer } from "./viewers/video-viewer";
import { SpreadsheetViewer } from "./viewers/spreadsheet-viewer";
import { DocumentViewer } from "./viewers/document-viewer";
import { UnsupportedViewer } from "./viewers/unsupported-viewer";
import { useCallback, useEffect, useRef, useState } from "react";

export function SolutionFullscreenViewer({
  open,
  onOpenChange,
  assets,
  initialIndex = 0,
}: SolutionFullscreenViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState<ViewerControls | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: Error | string | null) => {
    if (!err) {
      setError(null);
    } else if (typeof err === "string") {
      setError(err);
    } else {
      setError(
        err.message || "An unexpected error occurred while loading this asset.",
      );
    }
  }, []);

  // Navigation controller
  const {
    currentIndex,
    currentAsset,
    prev,
    next,
    hasPrev,
    hasNext,
    totalCount,
  } = useViewerNavigation({
    assets,
    initialIndex,
    open,
    onAssetChange: () => {
      // Clear controls, loading and errors when changing assets
      setControls(null);
      setIsLoading(false);
      setError(null);
    },
  });

  // Fullscreen controller
  const { isFullscreen, toggleFullscreen } = useViewerFullscreen(containerRef);

  // Prevent scrollbar layout shift or right gutter bug (MUI Fullscreen style)
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const originalGutter = document.documentElement.style.scrollbarGutter;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
      document.documentElement.style.scrollbarGutter = "auto";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.documentElement.style.scrollbarGutter = originalGutter;
      };
    }
  }, [open]);

  // Keyboard shortcut controller
  useViewerKeyboard({
    open,
    onClose: () => onOpenChange(false),
    onPrev: prev,
    onNext: next,
    hasPrev,
    hasNext,
    controls,
    toggleFullscreen,
  });

  if (!open || !currentAsset) return null;

  const previewType = getPreviewType(currentAsset);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Fullscreen Backdrop */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-150" />

        {/* Fullscreen Popup Viewport - MUI Style 100% edge-to-edge */}
        <DialogPrimitive.Popup
          ref={containerRef}
          aria-label={currentAsset.name}
          className="fixed inset-0 z-50 flex flex-col w-full h-full max-w-none max-h-none m-0 p-0 border-0 rounded-none bg-background/95 backdrop-blur-md text-foreground overflow-hidden outline-none select-none animate-in fade-in-0 duration-150"
          style={{
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: 0,
          }}
        >
          <TooltipProvider delay={200}>
            {/* Top Bar Header */}
            <ViewerTopBar
              asset={currentAsset}
              currentIndex={currentIndex}
              totalCount={totalCount}
              onClose={() => onOpenChange(false)}
            />

            {/* Canvas Viewport */}
            <main className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
              {isLoading && <ViewerLoading />}

              {error ? (
                <ViewerError
                  message={error}
                  fileUrl={currentAsset.file_url}
                  onRetry={() => setError(null)}
                />
              ) : (
                <div className="size-full min-h-0 flex items-center justify-center">
                  {previewType === "image" && (
                    <ImageViewer
                      key={currentAsset.id || currentAsset.file_url}
                      asset={currentAsset}
                      setControls={setControls}
                      onLoadingChange={setIsLoading}
                      onError={handleError}
                    />
                  )}
                  {previewType === "pdf" && (
                    <PdfViewer
                      key={currentAsset.id || currentAsset.file_url}
                      asset={currentAsset}
                      setControls={setControls}
                      onLoadingChange={setIsLoading}
                      onError={handleError}
                    />
                  )}
                  {previewType === "video" && (
                    <VideoViewer
                      key={currentAsset.id || currentAsset.file_url}
                      asset={currentAsset}
                      setControls={setControls}
                      onLoadingChange={setIsLoading}
                      onError={handleError}
                    />
                  )}
                  {previewType === "spreadsheet" && (
                    <SpreadsheetViewer
                      key={currentAsset.id || currentAsset.file_url}
                      asset={currentAsset}
                      setControls={setControls}
                      onLoadingChange={setIsLoading}
                      onError={handleError}
                    />
                  )}
                  {previewType === "document" && (
                    <DocumentViewer
                      key={currentAsset.id || currentAsset.file_url}
                      asset={currentAsset}
                      setControls={setControls}
                      onLoadingChange={setIsLoading}
                      onError={handleError}
                    />
                  )}
                  {previewType === "unsupported" && (
                    <UnsupportedViewer
                      key={currentAsset.id || currentAsset.file_url}
                      asset={currentAsset}
                      setControls={setControls}
                      onLoadingChange={setIsLoading}
                      onError={handleError}
                    />
                  )}
                </div>
              )}

              {/* Side Navigation Chevrons */}
              <ViewerNavigation
                onPrev={prev}
                onNext={next}
                hasPrev={hasPrev}
                hasNext={hasNext}
              />
            </main>

            {/* Fixed Bottom-Center Floating Toolbar */}
            <ViewerBottomToolbar
              asset={currentAsset}
              previewType={previewType}
              controls={controls}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </TooltipProvider>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
