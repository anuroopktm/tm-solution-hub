import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useCategories } from "@/features/categories";
import { useSolutions, SolutionGrid } from "@/features/solutions";

export default function CategorySolutionsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const { data: categories } = useCategories();
  const {
    data: solutions,
    isLoading: solutionsLoading,
    isError: solutionsError,
  } = useSolutions(categoryId);

  const activeCategory = categories?.find((c) => c.id === categoryId);

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 pt-0">
      {/* Page Heading with Count Badge */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {activeCategory?.name || "Category Solutions"}
            </h1>
            {solutions && (
              <Badge variant="secondary">
                {solutions.length}{" "}
                {solutions.length === 1 ? "solution" : "solutions"}
              </Badge>
            )}
          </div>

          <p className="max-w-3xl text-sm text-muted-foreground">
            {activeCategory?.description ||
              "Explore technical solutions belonging to this category."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/categories")}
          className="w-fit shrink-0 gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          All Categories
        </Button>
      </div>

      {/* Solutions Grid / Loading / Error / Empty states */}
      <SolutionGrid
        solutions={solutions}
        isLoading={solutionsLoading}
        isError={solutionsError}
        categoryName={activeCategory?.name}
        onSelectSolution={(id) => navigate(`/solutions/${id}`)}
        onNavigateCategories={() => navigate("/categories")}
      />
    </div>
  );
}
