import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/constants/category-icons";
import type { Category } from "@/types/category.types";

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <Card
      onClick={onClick}
      className="shine-card group/card cursor-pointer pt-0"
    >
      {/* 16:9 Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/60">
        {category.thumbnail_url ? (
          <img
            src={category.thumbnail_url}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted/80 to-muted text-muted-foreground/40 transition-colors group-hover/card:text-muted-foreground/70">
            <CategoryIcon
              name={category.icon}
              className="size-12 stroke-[1.25]"
            />
          </div>
        )}

        {/* Subtle hover overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/15 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100" />
      </div>

      {/* Content Area */}
      <CardHeader className="gap-0">
        <CardTitle className="line-clamp-1 flex items-center gap-2 text-base font-semibold leading-snug transition-colors group-hover/card:text-primary">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
            <CategoryIcon name={category.icon} className="size-3.5" />
          </div>
          <span className="truncate">{category.name}</span>
        </CardTitle>

        <CardAction>
          <Badge variant="secondary">
            {category.solutions_count ?? 0}{" "}
            <span className="hidden sm:inline">
              {category.solutions_count === 1 ? "solution" : "solutions"}
            </span>
          </Badge>
        </CardAction>

        <CardDescription className="col-span-2 line-clamp-2 leading-relaxed">
          {category.description ||
            "Click to explore solutions in this category."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
