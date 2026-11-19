export interface TooltipPayloadItem {
  value: number;
  payload: {
    name: string;
    shorthand: string;
    total: number;
    color: string;
  };
}

export interface CategoryChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

export function CategoryChartTooltip({
  active,
  payload,
}: CategoryChartTooltipProps) {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
        <div className="flex items-center gap-1.5 font-medium">
          <span
            className="size-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-semibold text-foreground">
            {item.shorthand}
          </span>
          <span className="text-muted-foreground">- {item.name}</span>
        </div>
        <p className="mt-1 text-muted-foreground">
          Solutions:{" "}
          <span className="font-semibold text-foreground">{item.total}</span>
        </p>
      </div>
    );
  }
  return null;
}
