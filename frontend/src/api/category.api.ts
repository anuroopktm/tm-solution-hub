import { apiClient } from "@/api/axios";
import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from "@/types/category.types";

interface BaseResponse<T> {
  detail: string;
  data: T;
}

export const categoryApi = {
  getCategories: async (search?: string): Promise<Category[]> => {
    const { data } = await apiClient.get<BaseResponse<Category[]>>(
      "/categories/",
      {
        params: search?.trim() ? { search: search.trim() } : undefined,
      },
    );

    return data.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<BaseResponse<Category>>(
      `/categories/${id}`,
    );

    return data.data;
  },

  createCategory: async (payload: CategoryCreatePayload): Promise<Category> => {
    const { data } = await apiClient.post<BaseResponse<Category>>(
      "/categories/",
      payload,
    );

    return data.data;
  },

  updateCategory: async (
    id: string,
    payload: CategoryUpdatePayload,
  ): Promise<Category> => {
    const { data } = await apiClient.put<BaseResponse<Category>>(
      `/categories/${id}`,
      payload,
    );

    return data.data;
  },

  deleteCategory: async (id: string): Promise<{ detail: string }> => {
    const { data } = await apiClient.delete<BaseResponse<{ detail: string }>>(
      `/categories/${id}`,
    );

    return data.data;
  },
};
