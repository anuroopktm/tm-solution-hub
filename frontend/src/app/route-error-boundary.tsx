import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ROUTES } from "@/routes/paths";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  // Check for dynamic import failure (common during new deployments or temporary network drops)
  const isChunkLoadError =
    error instanceof Error &&
    (error.message.includes("dynamically imported module") ||
      error.message.includes("Loading chunk") ||
      error.message.includes("Failed to fetch dynamically imported module") ||
      error.name === "ChunkLoadError");

  const isDev = import.meta.env.DEV;

  const errorMessage = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : isDev && error instanceof Error
      ? error.message
      : "An unexpected error occurred while loading this page. Please try refreshing.";

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="login-pattern relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <Card className="w-full max-w-lg rounded-xl ring-0">
        <CardContent className="p-0">
          <Empty className="min-h-90 gap-6 p-8">
            <EmptyHeader className="gap-3">
              <EmptyMedia
                variant="icon"
                className="size-16 rounded-2xl bg-destructive/10 text-destructive"
              >
                <AlertTriangle className="size-8" />
              </EmptyMedia>

              <EmptyTitle className="text-xl">
                {isChunkLoadError
                  ? "Application Update Detected"
                  : "Something went wrong"}
              </EmptyTitle>

              <EmptyDescription className="max-w-sm text-center">
                {isChunkLoadError
                  ? "A newer version of the application is available or your network connection was interrupted while loading this section. Please reload."
                  : errorMessage}
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="flex-row flex-wrap justify-center gap-2">
              <Button size="sm" onClick={handleReload}>
                <RefreshCw className="size-4" />
                Reload Application
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                <Home className="size-4" />
                Go to Dashboard
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}

export default RouteErrorBoundary;
