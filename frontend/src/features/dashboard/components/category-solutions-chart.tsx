import { useMemo } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types/dashboard.types";

import { getCategoryShade, getCategoryShorthand } from "../utils/chart.utils";
import { CategoryChartTooltip } from "./category-chart-tooltip";
import { CategoryChartLegend } from "./category-chart-legend";

export interface CategorySolutionsChartProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function CategorySolutionsChart({
  stats,
  isLoading = false,
}: CategorySolutionsChartProps) {
  const chartData = useMemo(() => {
    if (!stats?.categories_distribution) return [];

    const totalCategories = stats.categories_distribution.length;

    return stats.categories_distribution.map((item, index) => {
      const color = getCategoryShade(index, totalCategories);
      return {
        name: item.name,
        shorthand: getCategoryShorthand(item.name),
        total: item.total,
        color,
        fill: color,
      };
    });
  }, [stats]);

  if (isLoading || !stats) {
    return (
      <Card className="w-full gap-0 py-0">
        <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="flex">
            <Skeleton className="h-16 flex-1 rounded-none sm:w-28" />
            <Skeleton className="h-16 flex-1 rounded-none sm:w-28" />
            <Skeleton className="h-16 flex-1 rounded-none sm:w-28" />
          </div>
        </CardHeader>

        <CardContent className="px-2 py-4 sm:p-6">
          <Skeleton className="h-65 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const totals = stats.totals;

  return (
    <Card className="w-full gap-0 overflow-hidden py-0">
      {/* Header with Summary Metrics */}
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0">
          <CardTitle>Solutions Overview</CardTitle>
          <CardDescription>
            Distribution of technical solutions across categories.
          </CardDescription>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3">
          <div className="flex flex-col justify-center gap-1 border-t px-4 py-3 first:border-l-0 sm:border-t-0 sm:border-l sm:px-6 sm:py-6">
            <span className="text-xs text-muted-foreground">
              Total Solutions
            </span>
            <span className="text-lg leading-none font-bold sm:text-2xl">
              {totals.solutions.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col justify-center gap-1 border-t border-l px-4 py-3 sm:border-t-0 sm:px-6 sm:py-6">
            <span className="text-xs text-muted-foreground">Categories</span>
            <span className="text-lg leading-none font-bold sm:text-2xl">
              {totals.categories.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col justify-center gap-1 border-t border-l px-4 py-3 sm:border-t-0 sm:px-6 sm:py-6">
            <span className="text-xs text-muted-foreground">
              Recent Updates
            </span>
            <span className="text-lg leading-none font-bold sm:text-2xl">
              {totals.recent.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Chart & Category Legend */}
      <CardContent className="px-4 py-4 sm:p-6">
        {chartData.length === 0 ? (
          <div className="flex h-65 items-center justify-center text-sm text-muted-foreground">
            No category data available to display.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-65 w-full select-none outline-none [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none [&_path]:outline-none [&_rect]:outline-none [&_svg]:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 12,
                    left: -12,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />

                  <XAxis
                    dataKey="shorthand"
                    tickLine={false}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickMargin={8}
                  />

                  <YAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickMargin={8}
                  />

                  <Tooltip
                    content={<CategoryChartTooltip />}
                    cursor={{ fill: "hsl(var(--muted) / 0.2)", radius: 4 }}
                  />

                  <Bar
                    dataKey="total"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                    className="outline-none focus:outline-none"
                    activeBar={(props: unknown) => (
                      <Rectangle
                        {...(props as React.ComponentProps<typeof Rectangle>)}
                        fillOpacity={0.82}
                        stroke="none"
                        strokeWidth={0}
                        className="outline-none focus:outline-none"
                        style={{ outline: "none" }}
                      />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Legend with Shorthand + Color + Full Category Name */}
            <CategoryChartLegend items={chartData} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
