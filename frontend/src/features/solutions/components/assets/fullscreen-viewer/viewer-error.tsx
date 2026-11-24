import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ViewerErrorProps {
  message?: string;
  fileUrl?: string;
  onRetry?: () => void;
}

export function ViewerError({
  message = "Failed to load preview for this file.",
  fileUrl,
  onRetry,
}: ViewerErrorProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center text-foreground bg-background/80 backdrop-blur-md">
      <div className="p-6 rounded-2xl border border-border bg-card shadow-lg max-w-sm flex flex-col items-center">
        <div className="p-3.5 rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20 mb-3">
          <AlertTriangle className="size-7" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Preview Unavailable
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-5">{message}</p>

        <div className="flex items-center gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw />
              Retry
            </Button>
          )}
          {fileUrl && (
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              render={
                <a href={fileUrl} target="_blank" rel="noreferrer" download />
              }
            >
              <ExternalLink />
              Open Directly
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
