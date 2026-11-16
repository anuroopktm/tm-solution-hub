import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/api/category.api";

export const CATEGORY_QUERY_KEYS = {
  all: ["categories"] as const,
  list: () => [...CATEGORY_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...CATEGORY_QUERY_KEYS.all, "detail", id] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(),
    queryFn: () => categoryApi.getCategories(),
  });
}
