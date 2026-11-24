import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mammoth from "mammoth";
import type { BaseViewerRendererProps } from "../types/viewer.types";
import { Spinner } from "@/components/ui/spinner";
import { Search, FileText } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Sanitizes converted HTML from DOCX to eliminate any script/iframe tags.
 */
function sanitizeHtml(rawHtml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    const dangerousElements = doc.querySelectorAll(
      "script, iframe, object, embed, base, link, style",
    );
    dangerousElements.forEach((el) => el.remove());

    // Strip inline on* event attributes
    const allElements = doc.body.querySelectorAll("*");
    allElements.forEach((el) => {
      for (const attr of Array.from(el.attributes)) {
        if (
          attr.name.toLowerCase().startsWith("on") ||
          attr.value.toLowerCase().includes("javascript:")
        ) {
          el.removeAttribute(attr.name);
        }
      }
    });

    return doc.body.innerHTML;
  } catch {
    return rawHtml.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );
  }
}

export function DocumentViewer({
  asset,
  setControls,
  onError,
}: BaseViewerRendererProps) {
  const [content, setContent] = useState<string>("");
  const [isHtml, setIsHtml] = useState<boolean>(false);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const loading = loadedUrl !== asset.file_url;

  useEffect(() => {
    let cancelled = false;

    const loadDocument = async () => {
      try {
        const response = await fetch(asset.file_url);
        if (!response.ok) {
          throw new Error(
            `HTTP Error ${response.status}: Failed to fetch file`,
          );
        }

        const format = (asset.format || "").toLowerCase();
        const url = asset.file_url.toLowerCase();
        const isDocx = format === "docx" || url.endsWith(".docx");

        if (isDocx) {
          const buffer = await response.arrayBuffer();
          if (cancelled) return;
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          setContent(sanitizeHtml(result.value));
          setIsHtml(true);
        } else {
          // Markdown or plain text
          const text = await response.text();
          if (cancelled) return;
          setContent(text);
          setIsHtml(false);
        }
        if (!cancelled) {
          setLoadedUrl(asset.file_url);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to load document";
          onError?.(msg);
        }
      }
    };

    loadDocument();
    return () => {
      cancelled = true;
    };
  }, [asset.file_url, asset.format, onError]);

  useEffect(() => {
    setControls({
      document: {
        searchQuery,
        onSearchChange: setSearchQuery,
      },
    });

    return () => setControls(null);
  }, [searchQuery, setControls]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-foreground">
        <Spinner className="size-8 text-primary" />
        <p className="mt-3 text-xs text-muted-foreground">
          Rendering document content...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 max-w-4xl mx-auto overflow-hidden">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-3 mb-4 bg-card/90 backdrop-blur-md p-3 rounded-xl border border-border shadow-xs shrink-0">
        <div className="flex items-center gap-2 text-foreground text-xs font-medium truncate max-w-xs">
          <FileText className="size-4 text-primary" />
          <span className="truncate">{asset.name}</span>
        </div>

        <div className="relative min-w-45 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-muted/50 text-foreground placeholder:text-muted-foreground rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Reader Paper Sheet */}
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card p-6 sm:p-10 shadow-lg mb-16 text-card-foreground">
        {isHtml ? (
          <div
            className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
