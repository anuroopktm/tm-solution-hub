import type { AssetViewerProps } from "@/types/solution-asset.types";
import { formatFileSize } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Table, Download, ExternalLink } from "lucide-react";

export function SpreadsheetViewer({ asset }: AssetViewerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] max-h-[65vh] p-8 text-center bg-muted/20">
      <div className="p-5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 ring-1 ring-emerald-500/20">
        <Table className="size-12" />
      </div>

      <h3 className="font-heading text-base font-semibold text-foreground max-w-md truncate">
        {asset.name}
      </h3>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 mb-6">
        <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {asset.format} Workbook
        </span>
        {asset.file_size_bytes ? (
          <span>• {formatFileSize(asset.file_size_bytes)}</span>
        ) : null}
      </div>

      {asset.description && (
        <p className="text-xs text-muted-foreground max-w-md line-clamp-3 mb-6 bg-card border border-border/70 p-3 rounded-lg text-left">
          {asset.description}
        </p>
      )}

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
          <Download className="size-3.5 mr-1.5" />
          <span>Download Spreadsheet</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={asset.file_url} target="_blank" rel="noreferrer" />}
        >
          <ExternalLink className="size-3.5 mr-1.5" />
          <span>Open Link</span>
        </Button>
      </div>
    </div>
  );
}
