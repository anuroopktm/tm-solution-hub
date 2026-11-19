import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { solutionApi } from "@/api/solution.api";
import type {
  SolutionCreatePayload,
  SolutionUpdatePayload,
} from "@/types/solution.types";

export const SOLUTION_QUERY_KEYS = {
  all: ["solutions"] as const,
  list: (categoryId?: string) =>
    [...SOLUTION_QUERY_KEYS.all, "list", categoryId ?? "all"] as const,
  recent: () => [...SOLUTION_QUERY_KEYS.all, "recent"] as const,
  detail: (id: string) => [...SOLUTION_QUERY_KEYS.all, "detail", id] as const,
};

export function useSolutions(categoryId?: string) {
  return useQuery({
    queryKey: SOLUTION_QUERY_KEYS.list(categoryId),
    queryFn: () => solutionApi.getSolutions(categoryId),
  });
}

export function useRecentSolutions() {
  return useQuery({
    queryKey: SOLUTION_QUERY_KEYS.recent(),
    queryFn: () => solutionApi.getRecentSolutions(),
  });
}

export function useSolution(id?: string) {
  return useQuery({
    queryKey: SOLUTION_QUERY_KEYS.detail(id ?? ""),
    queryFn: () => solutionApi.getSolutionById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SolutionCreatePayload) =>
      solutionApi.createSolution(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLUTION_QUERY_KEYS.all });
    },
  });
}

export function useUpdateSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SolutionUpdatePayload;
    }) => solutionApi.updateSolution(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SOLUTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: SOLUTION_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => solutionApi.deleteSolution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLUTION_QUERY_KEYS.all });
    },
  });
}
