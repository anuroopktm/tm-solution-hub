import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SolutionOverviewCardProps {
  description: string | null;
}

export function SolutionOverviewCard({
  description,
}: SolutionOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Overview & Architecture
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {description || "No detailed description provided."}
        </p>
      </CardContent>
    </Card>
  );
}
