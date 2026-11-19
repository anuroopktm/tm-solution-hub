import { apiClient } from "@/api/axios";
import type {
  User,
  UserCreatePayload,
  UserUpdatePayload,
  UserDeleteResponse,
} from "@/types/user.types";

interface BaseResponse<T> {
  detail: string;
  data: T;
}

export const userApi = {
  getUsers: async (search?: string): Promise<User[]> => {
    const { data } = await apiClient.get<BaseResponse<User[]>>("/users/", {
      params: search?.trim() ? { search: search.trim() } : undefined,
    });
    return data.data;
  },

  createUser: async (payload: UserCreatePayload): Promise<User> => {
    const { data } = await apiClient.post<BaseResponse<User>>(
      "/users/create",
      payload,
    );
    return data.data;
  },

  updateUser: async (id: string, payload: UserUpdatePayload): Promise<User> => {
    const { data } = await apiClient.put<BaseResponse<User>>(
      `/users/${id}`,
      payload,
    );
    return data.data;
  },

  deleteUser: async (id: string): Promise<UserDeleteResponse> => {
    const { data } = await apiClient.delete<BaseResponse<UserDeleteResponse>>(
      `/users/${id}`,
    );
    return data.data;
  },

  restoreUser: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch<BaseResponse<User>>(
      `/users/${id}/restore`,
    );
    return data.data;
  },

  hardDeleteUser: async (id: string): Promise<UserDeleteResponse> => {
    const { data } = await apiClient.delete<BaseResponse<UserDeleteResponse>>(
      `/users/${id}/permanent`,
    );
    return data.data;
  },
};
