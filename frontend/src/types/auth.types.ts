export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type LoginResponse = TokenResponse;

export interface RefreshTokenRequest {
  refresh_token: string;
}

export type RefreshTokenResponse = TokenResponse;

export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  detail: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_deleted: boolean;
}
