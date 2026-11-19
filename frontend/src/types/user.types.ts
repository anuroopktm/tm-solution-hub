export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  password_hash?: string;
  is_deleted: boolean;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdatePayload {
  username?: string;
  email?: string;
  password?: string;
}

export interface UserDeleteResponse {
  id: string;
  detail: string;
}
