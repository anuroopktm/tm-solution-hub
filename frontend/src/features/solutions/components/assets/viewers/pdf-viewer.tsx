import type { AssetViewerProps } from "@/types/solution-asset.types";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";

export function PdfViewer({ asset, className }: AssetViewerProps) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* PDF Viewport */}
      <div className="relative flex-1 min-h-[450px] max-h-[70vh] w-full bg-muted/30">
        <object
          data={asset.file_url}
          type="application/pdf"
          className={`w-full h-[65vh] min-h-[450px] rounded-b-md ${className || ""}`}
        >
          {/* Fallback when browser doesn't embed PDFs */}
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <FileText className="size-10" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {asset.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your browser cannot display embedded PDFs directly.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="default"
                size="sm"
                nativeButton={false}
                render={
                  <a
                    href={asset.file_url}
                    target="_blank"
                    rel="noreferrer"
                    download={asset.name}
                  />
                }
              >
                <Download className="size-3.5 mr-1" />
                <span>Download PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <a href={asset.file_url} target="_blank" rel="noreferrer" />
                }
              >
                <ExternalLink className="size-3.5 mr-1" />
                <span>Open in New Tab</span>
              </Button>
            </div>
          </div>
        </object>
      </div>
    </div>
  );
}
