import type { AuthUserResponse, LoginDto, RegisterDto } from "@kresus/contract";

import { apiClient } from "@/api/client";

export const login = (dto: LoginDto): Promise<AuthUserResponse> =>
  apiClient.request<AuthUserResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(dto),
    autoRefreshToken: false,
  });

export const register = (dto: RegisterDto): Promise<AuthUserResponse> =>
  apiClient.request<AuthUserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(dto),
    autoRefreshToken: false,
  });

export const getMe = (): Promise<AuthUserResponse> =>
  apiClient.request<AuthUserResponse>("/auth/me");

export const logout = (): Promise<void> =>
  apiClient.request<void>("/auth/logout", { method: "POST", autoRefreshToken: false });

export const refresh = async (): Promise<boolean> => {
  try {
    await apiClient.request<void>("/auth/refresh", { method: "POST", autoRefreshToken: false });
    return true;
  } catch {
    return false;
  }
};
