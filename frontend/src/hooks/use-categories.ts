import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "@/api/category.api";
import type {
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from "@/types/category.types";

export const CATEGORY_QUERY_KEYS = {
  all: ["categories"] as const,
  list: (search?: string) =>
    [
      ...CATEGORY_QUERY_KEYS.all,
      "list",
      ...(search ? [{ search }] : []),
    ] as const,
  detail: (id: string) => [...CATEGORY_QUERY_KEYS.all, "detail", id] as const,
};

export function useCategories(search?: string) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(search),
    queryFn: () => categoryApi.getCategories(search),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryCreatePayload) =>
      categoryApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CategoryUpdatePayload;
    }) => categoryApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}
