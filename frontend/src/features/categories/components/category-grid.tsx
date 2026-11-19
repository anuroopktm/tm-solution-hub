import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyAction,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PackageOpen, Plus } from "lucide-react";
import { CategoryCard } from "./category-card";
import type { Category } from "@/types/category.types";

interface CategoryGridProps {
  categories?: Category[];
  isLoading: boolean;
  isError: boolean;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryGrid({
  categories,
  isLoading,
  isError,
  onSelectCategory,
}: CategoryGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load categories. Please try again later.
      </div>
    );
  }

  if (categories && categories.length === 0) {
    return (
      <Card className="shine-card-active w-full rounded-xl p-8 ring-0">
        <CardContent className="p-0">
          <Empty>
            <EmptyMedia>
              <PackageOpen />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No categories available</EmptyTitle>
              <EmptyDescription>
                No categories have been created yet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyAction>
              <Button size="sm" render={<Link to="/categories/new" />}>
                <Plus className="size-4" />
                <span>Create Category</span>
              </Button>
            </EmptyAction>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={() => onSelectCategory(category.id)}
        />
      ))}
    </div>
  );
}
