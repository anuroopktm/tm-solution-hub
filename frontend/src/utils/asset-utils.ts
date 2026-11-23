import type {
  SolutionAsset,
  SolutionAssetType,
} from "@/types/solution-asset.types";
import type { SolutionDocument, SolutionVideo } from "@/types/solution.types";
import { formatFileSize } from "./formatters";

export { formatFileSize };

const IMAGE_FORMATS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "svg",
  "gif",
  "avif",
  "bmp",
  "ico",
]);

const VIDEO_FORMATS = new Set([
  "mp4",
  "webm",
  "ogg",
  "mov",
  "avi",
  "mkv",
  "video",
]);

const DOCUMENT_FORMATS = new Set([
  "pdf",
  "doc",
  "docx",
  "txt",
  "md",
  "rtf",
  "odt",
]);

const SPREADSHEET_FORMATS = new Set(["xls", "xlsx", "csv", "tsv", "ods"]);

/**
 * Detects the normalized asset type from format and URL.
 */
export function detectAssetType(
  format?: string | null,
  url?: string | null,
): SolutionAssetType {
  const normalizedFormat = (format || "").trim().toLowerCase();

  if (IMAGE_FORMATS.has(normalizedFormat)) return "image";
  if (VIDEO_FORMATS.has(normalizedFormat)) return "video";
  if (
    DOCUMENT_FORMATS.has(normalizedFormat) ||
    SPREADSHEET_FORMATS.has(normalizedFormat)
  ) {
    return "document";
  }

  if (url) {
    const cleanUrl = url.toLowerCase().split("?")[0].split("#")[0];
    if (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      /\.(mp4|webm|ogg|mov)$/i.test(cleanUrl)
    ) {
      return "video";
    }
    if (
      url.startsWith("data:image/") ||
      url.startsWith("blob:") ||
      /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(cleanUrl)
    ) {
      return "image";
    }
    if (/\.(pdf|docx?|xlsx?|pptx?|csv)$/i.test(cleanUrl)) {
      return "document";
    }
  }

  return "other";
}

/**
 * Formats duration in seconds to standard MM:SS or HH:MM:SS string.
 */
export function formatDuration(seconds?: number | null): string {
  if (seconds == null || isNaN(seconds) || seconds < 0) return "";
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${minutes}:${pad(secs)}`;
}

/**
 * Converts a SolutionDocument to the unified SolutionAsset format.
 */
export function normalizeDocumentToAsset(doc: SolutionDocument): SolutionAsset {
  const type = detectAssetType(doc.format, doc.file_url);
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    type,
    format: (doc.format || "DOCUMENT").toUpperCase(),
    file_url: doc.file_url,
    file_size_bytes: doc.file_size_bytes,
    thumbnail_url: type === "image" ? doc.file_url : null,
  };
}

/**
 * Converts a SolutionVideo to the unified SolutionAsset format.
 */
export function normalizeVideoToAsset(video: SolutionVideo): SolutionAsset {
  return {
    id: video.id,
    name: video.title,
    description: video.description,
    type: "video",
    format: "MP4",
    file_url: video.video_url,
    duration_seconds: video.duration_seconds,
    thumbnail_url: video.thumbnail_url,
  };
}

/**
 * Merges and normalizes both documents and videos into a unified list of SolutionAsset items.
 */
export function normalizeSolutionAssets(
  documents?: SolutionDocument[] | null,
  videos?: SolutionVideo[] | null,
): SolutionAsset[] {
  const assets: SolutionAsset[] = [];

  if (documents && documents.length > 0) {
    for (const doc of documents) {
      assets.push(normalizeDocumentToAsset(doc));
    }
  }

  if (videos && videos.length > 0) {
    for (const video of videos) {
      assets.push(normalizeVideoToAsset(video));
    }
  }

  return assets;
}
