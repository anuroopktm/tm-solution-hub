import { useQuery } from "@tanstack/react-query";
import { solutionApi } from "@/api/solution.api";

export const SOLUTION_QUERY_KEYS = {
  all: ["solutions"] as const,
  list: (categoryId?: string) =>
    [...SOLUTION_QUERY_KEYS.all, "list", categoryId ?? "all"] as const,
  detail: (id: string) => [...SOLUTION_QUERY_KEYS.all, "detail", id] as const,
};

export function useSolutions(categoryId?: string) {
  return useQuery({
    queryKey: SOLUTION_QUERY_KEYS.list(categoryId),
    queryFn: () => solutionApi.getSolutions(categoryId),
  });
}

export function useSolution(id?: string) {
  return useQuery({
    queryKey: SOLUTION_QUERY_KEYS.detail(id ?? ""),
    queryFn: () => solutionApi.getSolutionById(id!),
    enabled: Boolean(id),
  });
}
