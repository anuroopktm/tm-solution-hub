import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useRefreshToken() {
  return useMutation({
    mutationFn: () => authService.refreshToken(),
  });
}
