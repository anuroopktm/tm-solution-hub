/**
 * Media type detection and URL parsing utilities.
 */

export type MediaType = "video" | "gif" | "image" | "unknown";

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov"]);
const GIF_EXTENSIONS = new Set(["gif"]);
const STATIC_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "svg",
  "avif",
]);

/**
 * Extracts the file extension from a URL, stripping query parameters and hash fragments.
 */
export function getFileExtension(url?: string | null): string {
  if (!url || typeof url !== "string") return "";

  try {
    const cleanUrl = url.split(/[?#]/)[0];
    const segments = cleanUrl.split("/");
    const filename = segments.pop() || "";
    const lastDotIndex = filename.lastIndexOf(".");

    if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
      return "";
    }

    return filename
      .slice(lastDotIndex + 1)
      .toLowerCase()
      .trim();
  } catch {
    return "";
  }
}

/**
 * Classifies an asset URL into 'video' | 'gif' | 'image' | 'unknown'.
 */
export function getMediaType(url?: string | null): MediaType {
  const ext = getFileExtension(url);

  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (GIF_EXTENSIONS.has(ext)) return "gif";
  if (STATIC_IMAGE_EXTENSIONS.has(ext)) return "image";

  return "unknown";
}

export function isVideoUrl(url?: string | null): boolean {
  return getMediaType(url) === "video";
}

export function isGifUrl(url?: string | null): boolean {
  return getMediaType(url) === "gif";
}

export function isImageUrl(url?: string | null): boolean {
  const type = getMediaType(url);
  return type === "image" || type === "gif";
}
