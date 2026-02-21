import { env } from "../config/env";

import { refresh } from "@/modules/auth/api/auth.api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

type RequestOptions = RequestInit & { autoRefreshToken?: boolean };

const createApiClient = () => {
  let refreshPromise: Promise<boolean> | null = null;

  const doRequest = async <T>(path: string, options: RequestInit): Promise<T> => {
    const response = await fetch(`${env.VITE_API_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  };

  const request = async <T>(path: string, { autoRefreshToken = true, ...fetchOptions }: RequestOptions = {}): Promise<T> => {
    try {
      return await doRequest<T>(path, fetchOptions);
    } catch (error) {
      if (autoRefreshToken && error instanceof ApiError && error.status === 401) {
        if (!refreshPromise) {
          refreshPromise = refresh().finally(() => {
            refreshPromise = null;
          });
        }
        const refreshed = await refreshPromise;
        if (refreshed) return doRequest<T>(path, fetchOptions);
      }
      throw error;
    }
  };

  return { request };
};

export const apiClient = createApiClient();
