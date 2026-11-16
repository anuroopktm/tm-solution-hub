import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, FileText } from "lucide-react";
import { formatFileSize } from "@/utils/formatters";
import type { SolutionDocument } from "@/types/solution.types";

interface SolutionDocumentsCardProps {
  documents: SolutionDocument[];
}

export function SolutionDocumentsCard({
  documents,
}: SolutionDocumentsCardProps) {
  if (!documents || documents.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FileText className="size-4 text-primary" />
          <span>Documents & Specifications</span>
        </CardTitle>
        <CardDescription>
          Technical whitepapers, deployment guides, and audits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.file_url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 rounded border bg-background px-2 py-1 text-xs font-bold text-muted-foreground">
                  {doc.format.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-medium text-foreground group-hover:underline">
                    {doc.name}
                  </h4>
                  {doc.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-muted-foreground ml-3">
                {doc.file_size_bytes && (
                  <span className="text-xs">
                    {formatFileSize(doc.file_size_bytes)}
                  </span>
                )}
                <ExternalLink className="size-3.5 group-hover:text-foreground" />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
