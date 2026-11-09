import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import type { LoginRequest } from "@/types/auth.types";

export const AUTH_QUERY_KEYS = {
  all: ["auth"] as const,
  currentUser: () => [...AUTH_QUERY_KEYS.all, "current-user"] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),

    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser(), user);
    },
  });
}
