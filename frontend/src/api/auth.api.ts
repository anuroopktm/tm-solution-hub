import { apiClient } from "@/api/axios";

import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from "../types/auth.types";

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );

    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/auth/me");

    return data;
  },

  refreshToken: async (
    payload: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> => {
    const { data } = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      payload,
    );

    return data;
  },

  logout: async (payload: LogoutRequest): Promise<LogoutResponse> => {
    const { data } = await apiClient.post<LogoutResponse>(
      "/auth/logout",
      payload,
    );

    return data;
  },
};
