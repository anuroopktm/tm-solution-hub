import { apiClient } from "@/api/axios";
import type { Solution } from "@/types/solution.types";

export const solutionApi = {
  getSolutions: async (categoryId?: string): Promise<Solution[]> => {
    const params = categoryId ? { category_id: categoryId } : {};
    const { data } = await apiClient.get<Solution[]>("/solutions/", {
      params,
    });

    return data;
  },

  getSolutionById: async (id: string): Promise<Solution> => {
    const { data } = await apiClient.get<{ detail: string; data: Solution }>(
      `/solutions/${id}`,
    );

    return data.data;
  },
};
