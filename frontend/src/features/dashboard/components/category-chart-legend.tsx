export interface CategoryLegendItem {
  name: string;
  shorthand: string;
  total: number;
  color: string;
}

export interface CategoryChartLegendProps {
  items: CategoryLegendItem[];
}

export function CategoryChartLegend({ items }: CategoryChartLegendProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-semibold text-foreground">
            {item.shorthand}
          </span>
          <span>- {item.name}</span>
          <span className="text-muted-foreground/75">({item.total})</span>
        </div>
      ))}
    </div>
  );
}
