import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SolutionCard } from "@/features/solutions/components/solution-card";
import type { Solution } from "@/types/solution.types";

export interface RecentSolutionsSectionProps {
  solutions?: Solution[];
  isLoading?: boolean;
  onSelectSolution?: (id: string) => void;
}

export function RecentSolutionsSection({
  solutions = [],
  isLoading = false,
  onSelectSolution,
}: RecentSolutionsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Recently Added Solutions
          </h2>
          <p className="text-sm text-muted-foreground">
            Latest enterprise templates, architectures, and accelerators.
          </p>
        </div>

        <Button variant="ghost" size="sm" render={<Link to="/categories" />}>
          View all
          <ArrowRight />
        </Button>
      </div>

      {isLoading ? (
        <ScrollArea className="w-full min-w-0">
          <div className="flex w-max gap-4 pb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-72 shrink-0 space-y-3">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : solutions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No recent solutions found.
          </p>
        </div>
      ) : (
        <ScrollArea className="w-full min-w-0">
          <div className="flex w-max gap-4 pb-4">
            {solutions.map((solution) => (
              <div key={solution.id} className="w-80 shrink-0">
                <SolutionCard
                  solution={solution}
                  onClick={() => onSelectSolution?.(solution.id)}
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </section>
  );
}
