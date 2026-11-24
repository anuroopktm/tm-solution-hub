import { Document, Page, pdfjs } from "react-pdf";
import type { BaseViewerRendererProps } from "../types/viewer.types";
import type { SolutionAsset } from "@/types/solution-asset.types";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Component, useCallback, useEffect, useRef, useState } from "react";

// Configure PDF.js worker using same-origin static public asset
if (typeof window !== "undefined") {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "/pdf.worker.min.mjs",
      window.location.origin,
    ).href;
  } catch {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
}

interface PdfErrorBoundaryProps {
  children: React.ReactNode;
  asset: SolutionAsset;
}

interface PdfErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PdfErrorBoundary extends Component<
  PdfErrorBoundaryProps,
  PdfErrorBoundaryState
> {
  constructor(props: PdfErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PdfErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error) {
    console.warn("PdfViewer error caught:", error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-white">
          <FileText className="size-16 text-primary mb-4" />
          <p className="text-base font-semibold">{this.props.asset.name}</p>
          <p className="text-xs text-white/70 mt-1 mb-4">
            Unable to render embedded PDF preview. You can open or download the
            PDF directly.
          </p>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={this.props.asset.file_url}
                  download={this.props.asset.name}
                />
              }
            >
              <Download className="size-3.5 mr-1.5" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              className="border-white/20 text-white hover:bg-white/10"
              render={
                <a
                  href={this.props.asset.file_url}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <ExternalLink className="size-3.5 mr-1.5" />
              Open in New Tab
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function PdfViewer({
  asset,
  setControls,
  onError,
}: BaseViewerRendererProps) {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width for responsive fit
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(
          Math.min(containerRef.current.clientWidth - 48, 1000),
        );
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPageNumber((p) => Math.max(p - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPageNumber((p) => Math.min(p + 1, numPages));
  }, [numPages]);

  const handleGoToPage = useCallback(
    (page: number) => {
      setPageNumber(Math.max(1, Math.min(page, numPages)));
    },
    [numPages],
  );

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(s - 0.2, 0.6));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1.2);
  }, []);

  // Sync controls with bottom-center toolbar
  useEffect(() => {
    setControls({
      pagination: {
        currentPage: pageNumber,
        totalPages: numPages,
        goToPage: handleGoToPage,
        nextPage: handleNextPage,
        prevPage: handlePrevPage,
      },
      zoom: {
        scale,
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        reset: handleResetZoom,
      },
    });

    return () => setControls(null);
  }, [
    pageNumber,
    numPages,
    scale,
    setControls,
    handleGoToPage,
    handleNextPage,
    handlePrevPage,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
  ]);

  return (
    <PdfErrorBoundary asset={asset}>
      <div
        ref={containerRef}
        className="size-full overflow-auto flex flex-col items-center p-4 sm:p-6"
      >
        <Document
          file={asset.file_url}
          onLoadSuccess={({ numPages: loadedPages }) => {
            setNumPages(loadedPages);
            setPageNumber(1);
          }}
          onLoadError={(err) => {
            onError?.(
              err.message ||
                "Failed to load PDF document. It might be blocked or inaccessible.",
            );
          }}
          loading={
            <div className="flex flex-col items-center justify-center p-12 text-white">
              <Spinner className="size-8 text-primary" />
              <p className="mt-3 text-xs text-white/70">
                Rendering PDF document...
              </p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center p-12 text-center text-white">
              <p className="text-sm font-medium text-rose-400">
                Failed to load PDF.
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  className="border-white/20 text-white"
                  render={<a href={asset.file_url} download={asset.name} />}
                >
                  <Download className="size-3.5 mr-1" />
                  Download PDF
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a href={asset.file_url} target="_blank" rel="noreferrer" />
                  }
                >
                  <ExternalLink className="size-3.5 mr-1" />
                  Open External
                </Button>
              </div>
            </div>
          }
        >
          <div className="shadow-2xl rounded-md overflow-hidden bg-white mb-20 transition-transform duration-200">
            <Page
              pageNumber={pageNumber}
              scale={scale}
              width={containerWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div className="w-150 h-200 flex items-center justify-center bg-white/5">
                  <Spinner className="size-6 text-primary" />
                </div>
              }
            />
          </div>
        </Document>
      </div>
    </PdfErrorBoundary>
  );
}
