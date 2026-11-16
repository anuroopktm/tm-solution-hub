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
  EmptyAction,
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
      <Card className="w-full max-w-md">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia className="bg-destructive/10 text-destructive">
                <AlertTriangle className="size-7" />
              </EmptyMedia>
              <EmptyTitle>
                {isChunkLoadError
                  ? "Application Update Detected"
                  : "Something went wrong"}
              </EmptyTitle>
              <EmptyDescription>
                {isChunkLoadError
                  ? "A newer version of the application is available or network connection was interrupted while loading this section. Please reload."
                  : errorMessage}
              </EmptyDescription>
            </EmptyHeader>

            <EmptyAction>
              <Button size="sm" onClick={handleReload}>
                <RefreshCw />
                Reload Application
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                <Home />
                Go to Dashboard
              </Button>
            </EmptyAction>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}

export default RouteErrorBoundary;
