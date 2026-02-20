import type { AuthUserResponse, LoginDto, RegisterDto } from "@kresus/contract";

import { apiClient } from "@/api/client";

export const login = (dto: LoginDto): Promise<AuthUserResponse> =>
  apiClient.request<AuthUserResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(dto),
  });

export const register = (dto: RegisterDto): Promise<AuthUserResponse> =>
  apiClient.request<AuthUserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(dto),
  });
