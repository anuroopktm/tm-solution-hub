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
  CardAction,
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

  const summaryMetrics = stats
    ? [
        {
          label: "Total Solutions",
          value: stats.totals.solutions,
        },
        {
          label: "Categories",
          value: stats.totals.categories,
        },
        {
          label: "Recent Updates",
          value: stats.totals.recent,
        },
      ]
    : [];

  if (isLoading || !stats) {
    return (
      <Card className="w-full gap-0 overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-18 w-28 rounded-lg" />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Skeleton className="h-65 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full gap-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Solutions Overview</CardTitle>
          <CardDescription>
            Distribution of technical solutions across categories.
          </CardDescription>
        </div>

        {/* Summary Metrics */}
        <CardAction className="flex w-full flex-wrap items-stretch justify-start gap-2 sm:w-auto sm:justify-end">
          {summaryMetrics.map((metric) => (
            <Card
              key={metric.label}
              size="sm"
              className="min-w-0 flex-1 gap-1 sm:min-w-28 sm:flex-none shadow-md"
            >
              <CardHeader>
                <CardDescription className="text-xs whitespace-nowrap">
                  {metric.label}
                </CardDescription>

                <CardTitle className="text-xl tabular-nums tracking-tight">
                  {metric.value.toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </CardAction>
      </CardHeader>

      {/* Chart and Legend */}
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
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
                    cursor={{
                      fill: "hsl(var(--muted) / 0.2)",
                      radius: 4,
                    }}
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

            <CategoryChartLegend items={chartData} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
