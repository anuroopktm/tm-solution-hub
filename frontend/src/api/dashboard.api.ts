import { apiClient } from "@/api/axios";
import type { DashboardStats } from "@/types/dashboard.types";

interface BaseResponse<T> {
  detail: string;
  data: T;
}

export const dashboardApi = {
  getStats: async (recentLimit = 5): Promise<DashboardStats> => {
    const { data } = await apiClient.get<BaseResponse<DashboardStats>>(
      "/dashboard/stats",
      {
        params: { recent_limit: recentLimit },
      },
    );
    return data.data;
  },
};
