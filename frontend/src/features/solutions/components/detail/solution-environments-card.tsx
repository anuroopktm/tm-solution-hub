import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe } from "lucide-react";
import type { SolutionServiceUrl } from "@/types/solution.types";

interface SolutionEnvironmentsCardProps {
  serviceUrls: SolutionServiceUrl[];
}

export function SolutionEnvironmentsCard({
  serviceUrls,
}: SolutionEnvironmentsCardProps) {
  if (!serviceUrls || serviceUrls.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Globe className="size-4 text-primary" />
          Live Environments
        </CardTitle>
        <CardDescription>
          Direct deployment targets and service endpoints.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {serviceUrls.map((srv) => (
            <a
              key={srv.id}
              href={srv.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Badge
                  variant="secondary"
                  className="shrink-0 text-xs font-normal"
                >
                  {srv.environment || "Target"}
                </Badge>

                <span className="truncate font-medium">{srv.service_name}</span>
              </div>

              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
