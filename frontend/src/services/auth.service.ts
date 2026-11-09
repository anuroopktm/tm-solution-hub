import { authApi } from "../api/auth.api";
import { authStorage } from "@/utils/auth-storage";

import type { LoginRequest, User } from "../types/auth.types";

export const authService = {
  login: async (payload: LoginRequest): Promise<User> => {
    const response = await authApi.login(payload);

    authStorage.setToken(response.access_token);

    try {
      const user = await authApi.getCurrentUser();

      return user;
    } catch (error) {
      authStorage.removeToken();
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    return authApi.getCurrentUser();
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      authStorage.removeToken();
    }
  },
};
