export { DashboardView } from "./components/dashboard-view";
export { CategorySolutionsChart } from "./components/category-solutions-chart";
export { RecentSolutionsSection } from "./components/recent-solutions-section";
export { CategoryChartTooltip } from "./components/category-chart-tooltip";
export { CategoryChartLegend } from "./components/category-chart-legend";

export { useDashboardStats, DASHBOARD_QUERY_KEYS } from "@/hooks/use-dashboard";
export { getCategoryShade, getCategoryShorthand } from "./utils/chart.utils";

export type { CategorySolutionsChartProps } from "./components/category-solutions-chart";
export type { RecentSolutionsSectionProps } from "./components/recent-solutions-section";
export type {
  CategoryChartTooltipProps,
  TooltipPayloadItem,
} from "./components/category-chart-tooltip";
export type {
  CategoryChartLegendProps,
  CategoryLegendItem,
} from "./components/category-chart-legend";
