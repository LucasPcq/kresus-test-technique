import { env } from "../config/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) throw new ApiError(response.status, await response.json());

  return response.json() as Promise<T>;
};

export const apiClient = { request };
