import type { SolutionAsset } from "@/types/solution-asset.types";
import { ImageViewer } from "./image-viewer";
import { PdfViewer } from "./pdf-viewer";
import { VideoViewer } from "./video-viewer";
import { DocumentViewer } from "./document-viewer";
import { SpreadsheetViewer } from "./spreadsheet-viewer";
import { UnsupportedPreview } from "./unsupported-preview";

export function AssetPreview({ asset }: { asset: SolutionAsset }) {
  const format = (asset.format || "").trim().toLowerCase();

  if (
    asset.type === "image" ||
    ["png", "jpg", "jpeg", "webp", "svg", "gif", "avif"].includes(format)
  ) {
    return <ImageViewer asset={asset} />;
  }

  if (format === "pdf") {
    return <PdfViewer asset={asset} />;
  }

  if (
    asset.type === "video" ||
    ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(format)
  ) {
    return <VideoViewer asset={asset} />;
  }

  if (["doc", "docx", "txt", "rtf", "md"].includes(format)) {
    return <DocumentViewer asset={asset} />;
  }

  if (["xls", "xlsx", "csv", "tsv", "ods"].includes(format)) {
    return <SpreadsheetViewer asset={asset} />;
  }

  return <UnsupportedPreview asset={asset} />;
}
