import { apiClient } from "@/api/axios";
import type { Category } from "@/types/category.types";

interface BaseResponse<T> {
  detail: string;
  data: T;
}

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data } =
      await apiClient.get<BaseResponse<Category[]>>("/categories/");

    return data.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<BaseResponse<Category>>(
      `/categories/${id}`,
    );

    return data.data;
  },
};
