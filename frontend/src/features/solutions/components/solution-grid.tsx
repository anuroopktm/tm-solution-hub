import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AlertCircle, PackageOpen } from "lucide-react";
import { SolutionCard } from "./solution-card";
import type { Solution } from "@/types/solution.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SolutionGridProps {
  solutions?: Solution[];
  isLoading: boolean;
  isError: boolean;
  categoryName?: string;
  onSelectSolution: (solutionId: string) => void;
  onNavigateCategories: () => void;
}

export function SolutionGrid({
  solutions,
  isLoading,
  isError,
  categoryName,
  onSelectSolution,
  onNavigateCategories,
}: SolutionGridProps) {
  // Skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Failed to load solutions</AlertTitle>
        <AlertDescription>
          Something went wrong while fetching solutions for this category.
          Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Category Empty State (No solutions exist in category)
  if (!solutions || solutions.length === 0) {
    return (
      <Card className="shine-card-active w-full rounded-xl ring-0">
        <CardContent className="p-0">
          <Empty className="min-h-80 gap-6">
            <EmptyHeader className="gap-3">
              <EmptyMedia variant="icon" className="size-16 rounded-2xl">
                <PackageOpen className="size-8" />
              </EmptyMedia>

              <EmptyTitle className="text-lg">
                No solutions in this category
              </EmptyTitle>

              <EmptyDescription className="max-w-sm text-center">
                There are currently no solutions linked to{" "}
                {categoryName || "this category"}. Check back later or explore
                other categories.
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="flex-row justify-center">
              <Button variant="outline" onClick={onNavigateCategories}>
                View all categories
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  // Solutions Grid
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {solutions.map((solution) => (
        <SolutionCard
          key={solution.id}
          solution={solution}
          onClick={() => onSelectSolution(solution.id)}
        />
      ))}
    </div>
  );
}
