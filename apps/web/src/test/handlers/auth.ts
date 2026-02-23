import { http, HttpResponse } from "msw";

import { env } from "@/config/env";

import { mockAuthUser } from "../mocks/auth";

export const authHandlers = [
  http.post(`${env.VITE_API_URL}/auth/login`, () => HttpResponse.json(mockAuthUser)),
  http.post(`${env.VITE_API_URL}/auth/register`, () => HttpResponse.json(mockAuthUser)),
  http.get(`${env.VITE_API_URL}/auth/me`, () => HttpResponse.json(mockAuthUser)),
  http.post(`${env.VITE_API_URL}/auth/logout`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${env.VITE_API_URL}/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
];
