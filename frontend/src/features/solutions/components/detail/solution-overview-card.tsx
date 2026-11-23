import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";

interface SolutionOverviewCardProps {
  description: string | null;
}

export function SolutionOverviewCard({
  description,
}: SolutionOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Info className="size-4 text-primary" />
          Overview & Architecture
        </CardTitle>
        <CardDescription>
          Detailed scope, architecture outline, and technical context.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {description || "No detailed description provided."}
        </p>
      </CardContent>
    </Card>
  );
}
