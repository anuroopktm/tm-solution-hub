import { apiClient } from "@/api/axios";
import type {
  Solution,
  SolutionCreatePayload,
  SolutionUpdatePayload,
} from "@/types/solution.types";

interface BaseResponse<T> {
  detail: string;
  data: T;
}

export const solutionApi = {
  getSolutions: async (categoryId?: string): Promise<Solution[]> => {
    const params = categoryId ? { category_id: categoryId } : {};
    const { data } = await apiClient.get<Solution[]>("/solutions/", {
      params,
    });

    return data;
  },

  getRecentSolutions: async (): Promise<Solution[]> => {
    const { data } =
      await apiClient.get<BaseResponse<Solution[]>>("/solutions/recent");
    return data.data;
  },

  getSolutionById: async (id: string): Promise<Solution> => {
    const { data } = await apiClient.get<{ detail: string; data: Solution }>(
      `/solutions/${id}`,
    );

    return data.data;
  },

  createSolution: async (payload: SolutionCreatePayload): Promise<Solution> => {
    const { data } = await apiClient.post<BaseResponse<Solution>>(
      "/solutions/",
      payload,
    );

    return data.data;
  },

  updateSolution: async (
    id: string,
    payload: SolutionUpdatePayload,
  ): Promise<Solution> => {
    const { data } = await apiClient.put<BaseResponse<Solution>>(
      `/solutions/${id}`,
      payload,
    );

    return data.data;
  },

  deleteSolution: async (id: string): Promise<{ detail: string }> => {
    const { data } = await apiClient.delete<BaseResponse<{ detail: string }>>(
      `/solutions/${id}`,
    );

    return data.data;
  },
};
