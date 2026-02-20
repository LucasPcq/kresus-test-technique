import { http, HttpResponse } from "msw";

import type { AuthUserResponse } from "@kresus/contract";

import { env } from "@/config/env";

export const mockAuthUser: AuthUserResponse = { id: "1", email: "test@example.com" };

export const authHandlers = [
  http.post(`${env.VITE_API_URL}/auth/login`, () => HttpResponse.json(mockAuthUser)),
  http.post(`${env.VITE_API_URL}/auth/register`, () => HttpResponse.json(mockAuthUser)),
];
