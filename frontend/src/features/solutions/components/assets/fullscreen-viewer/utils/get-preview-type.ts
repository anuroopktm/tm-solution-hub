import type { SolutionAsset } from "@/types/solution-asset.types";
import type { PreviewType } from "../types/viewer.types";

const IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "svg",
  "gif",
  "avif",
  "bmp",
  "ico",
];

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];

const SPREADSHEET_EXTENSIONS = ["csv", "tsv", "xls", "xlsx", "ods"];

const DOCUMENT_EXTENSIONS = ["doc", "docx", "txt", "rtf", "md", "markdown"];

export function getPreviewType(asset: SolutionAsset): PreviewType {
  const format = (asset.format || "").trim().toLowerCase();
  const url = (asset.file_url || "").toLowerCase();

  if (asset.type === "image" || IMAGE_EXTENSIONS.includes(format)) {
    return "image";
  }

  if (format === "pdf" || url.endsWith(".pdf") || url.includes(".pdf?")) {
    return "pdf";
  }

  if (
    asset.type === "video" ||
    VIDEO_EXTENSIONS.includes(format) ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  ) {
    return "video";
  }

  if (SPREADSHEET_EXTENSIONS.includes(format)) {
    return "spreadsheet";
  }

  if (DOCUMENT_EXTENSIONS.includes(format)) {
    return "document";
  }

  // Fallback checks by URL extension if format is unspecified
  for (const ext of IMAGE_EXTENSIONS) {
    if (url.includes(`.${ext}`)) return "image";
  }
  for (const ext of VIDEO_EXTENSIONS) {
    if (url.includes(`.${ext}`)) return "video";
  }
  for (const ext of SPREADSHEET_EXTENSIONS) {
    if (url.includes(`.${ext}`)) return "spreadsheet";
  }
  for (const ext of DOCUMENT_EXTENSIONS) {
    if (url.includes(`.${ext}`)) return "document";
  }

  return "unsupported";
}
