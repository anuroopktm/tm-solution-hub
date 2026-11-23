import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <CardDescription>
          Core architectural pillars and functional strengths.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {capabilities.map((cap, idx) => (
            <Card
              size="sm"
              key={idx}
              className="rounded-lg bg-muted shadow-none"
            >
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  {cap.name}
                </CardTitle>

                {cap.description && (
                  <CardDescription className="text-xs leading-relaxed">
                    {cap.description}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
