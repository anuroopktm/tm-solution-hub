import type { AssetViewerProps } from "@/types/solution-asset.types";
import { formatDuration } from "@/utils/asset-utils";

/**
 * Extracts YouTube/Vimeo embed URLs if applicable.
 */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      const v = urlObj.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.includes("embed") || pathParts.includes("v")) {
        const id = pathParts[pathParts.length - 1];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    }
    if (urlObj.hostname.includes("youtu.be")) {
      const id = urlObj.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (urlObj.hostname.includes("vimeo.com")) {
      const parts = urlObj.pathname.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}?autoplay=1`;
      }
    }
  } catch {
    // Invalid URL format
  }

  return null;
}

export function VideoViewer({ asset, className }: AssetViewerProps) {
  const embedUrl = getEmbedUrl(asset.file_url);

  return (
    <div className="flex flex-col h-full w-full bg-black/95">
      {/* Viewport */}
      <div className="relative flex-1 min-h-[360px] max-h-[65vh] flex items-center justify-center p-2">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={asset.name}
            className={`w-full h-full aspect-video rounded-md border-0 max-h-[60vh] ${className || ""}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={asset.file_url}
            controls
            autoPlay
            className={`w-full max-h-[60vh] rounded-md object-contain ${className || ""}`}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {asset.duration_seconds && (
        <div className="border-t border-border/20 px-4 py-2 text-xs text-muted-foreground bg-background/50 flex justify-between">
          <span>Duration</span>
          <span className="font-mono">
            {formatDuration(asset.duration_seconds)}
          </span>
        </div>
      )}
    </div>
  );
}
