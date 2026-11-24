import { authApi } from "@/api/auth.api";
import { authStorage } from "@/utils/auth-storage";
import type {
  LoginRequest,
  RefreshTokenResponse,
  User,
} from "@/types/auth.types";

export const authService = {
  login: async (payload: LoginRequest): Promise<User> => {
    const response = await authApi.login(payload);

    authStorage.setTokens({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    });

    try {
      const user = await authApi.getCurrentUser();

      return user;
    } catch (error) {
      authStorage.clearTokens();
      throw error;
    }
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const currentRefreshToken = authStorage.getRefreshToken();

    if (!currentRefreshToken) {
      authStorage.clearTokens();
      throw new Error("No refresh token available");
    }

    try {
      const response = await authApi.refreshToken({
        refresh_token: currentRefreshToken,
      });

      authStorage.setTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });

      return response;
    } catch (error) {
      authStorage.clearTokens();
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    return authApi.getCurrentUser();
  },

  logout: async (): Promise<void> => {
    const currentRefreshToken = authStorage.getRefreshToken();

    try {
      if (currentRefreshToken) {
        await authApi.logout({ refresh_token: currentRefreshToken });
      }
    } finally {
      authStorage.clearTokens();
    }
  },
};
