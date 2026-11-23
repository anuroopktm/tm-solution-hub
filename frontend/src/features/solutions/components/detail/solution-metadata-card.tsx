import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import type { Solution } from "@/types/solution.types";

interface SolutionTechStackCardProps {
  techStack?: string[];
}

export function SolutionTechStackCard({
  techStack,
}: SolutionTechStackCardProps) {
  if (!techStack || techStack.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Layers className="size-4 text-primary" />
          Technology Stack
        </CardTitle>
        <CardDescription>
          Languages, frameworks, and core libraries.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="font-normal">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SolutionMetadataCard({ solution }: { solution: Solution }) {
  return <SolutionTechStackCard techStack={solution.tech_stack} />;
}
