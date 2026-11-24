import type { BaseViewerRendererProps } from "../types/viewer.types";
import { formatFileSize } from "../utils/format-file-size";
import { FileQuestion, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function UnsupportedViewer({ asset }: BaseViewerRendererProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-foreground max-w-md">
      <div className="p-5 rounded-2xl bg-muted/60 text-muted-foreground mb-4 ring-1 ring-border">
        <FileQuestion className="size-12" />
      </div>

      <h3 className="font-heading text-base font-semibold text-foreground truncate max-w-sm">
        {asset.name}
      </h3>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 mb-4">
        <Badge variant="secondary" className="uppercase">
          {asset.format || "Unknown Format"}
        </Badge>
        {asset.file_size_bytes ? (
          <span>• {formatFileSize(asset.file_size_bytes)}</span>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground mb-6 text-center">
        A direct in-browser preview is not available for this file type. You can
        download or open it using an external application.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="default"
          size="sm"
          nativeButton={false}
          render={
            <a
              href={asset.file_url}
              download={asset.name}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <Download />
          <span>Download File</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={asset.file_url} target="_blank" rel="noreferrer" />}
        >
          <ExternalLink />
          <span>Open Link</span>
        </Button>
      </div>
    </div>
  );
}
