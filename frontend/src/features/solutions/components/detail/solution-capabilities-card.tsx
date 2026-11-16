import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { KeyCapability } from "@/types/solution.types";

interface SolutionCapabilitiesCardProps {
  capabilities: KeyCapability[];
}

export function SolutionCapabilitiesCard({
  capabilities,
}: SolutionCapabilitiesCardProps) {
  if (!capabilities || capabilities.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="size-4 text-primary" />
          <span>Key Capabilities</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border/60 bg-muted/20 p-3"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {cap.name}
              </h3>
              {cap.description && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {cap.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
