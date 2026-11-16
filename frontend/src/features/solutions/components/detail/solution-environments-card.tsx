import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <span>Live Environments</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {serviceUrls.map((srv) => (
            <a
              key={srv.id}
              href={srv.target_url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs transition-colors hover:bg-muted/60"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  {srv.environment}
                </span>
                <span className="truncate font-medium text-foreground group-hover:underline">
                  {srv.service_name}
                </span>
              </div>
              <ExternalLink className="size-3 text-muted-foreground group-hover:text-foreground" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
