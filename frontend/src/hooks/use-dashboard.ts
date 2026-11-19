import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard.api";

export const DASHBOARD_QUERY_KEYS = {
  all: ["dashboard"] as const,
  stats: (recentLimit = 5) =>
    [...DASHBOARD_QUERY_KEYS.all, "stats", recentLimit] as const,
};

export function useDashboardStats(recentLimit = 5) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats(recentLimit),
    queryFn: () => dashboardApi.getStats(recentLimit),
  });
}
