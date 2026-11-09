import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { authStorage } from "@/utils/auth-storage";
import { AUTH_QUERY_KEYS } from "./use-login";

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser(),

    queryFn: () => authService.getCurrentUser(),

    enabled: !!authStorage.getToken(),

    retry: false,
  });
}
