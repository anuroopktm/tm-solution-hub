import type { AxiosError } from "axios";

export interface ApiErrorResponse {
  detail: string;
}

export type ApiError = AxiosError<ApiErrorResponse>;
