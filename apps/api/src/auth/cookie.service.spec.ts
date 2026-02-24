import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyReply } from "fastify";
import { ConfigService } from "@nestjs/config";

import { CookieService } from "./cookie.service";
import { AUTH_COOKIES } from "./auth.constants";

const mockConfigService = {
  get: vi.fn().mockReturnValue(undefined),
  getOrThrow: vi.fn().mockImplementation((key: string) => {
    if (key === "JWT_REFRESH_EXPIRES_IN") return "7d";
    return "15m";
  }),
};

const mockSetCookie = vi.fn();
const mockClearCookie = vi.fn();
const mockRes = {
  setCookie: mockSetCookie,
  clearCookie: mockClearCookie,
} as unknown as FastifyReply;

describe("CookieService", () => {
  let service: CookieService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CookieService(mockConfigService as unknown as ConfigService);
  });

  describe("setTokens", () => {
    it("should set access_token, refresh_token and session cookies when called", () => {
      service.setTokens(mockRes, { token: "jwt_token", refreshToken: "refresh_token" });

      expect(mockSetCookie).toHaveBeenCalledWith(
        AUTH_COOKIES.ACCESS_TOKEN,
        "jwt_token",
        expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
      );
      expect(mockSetCookie).toHaveBeenCalledWith(
        AUTH_COOKIES.REFRESH_TOKEN,
        "refresh_token",
        expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
      );
      expect(mockSetCookie).toHaveBeenCalledWith(
        AUTH_COOKIES.SESSION,
        "1",
        expect.objectContaining({ sameSite: "strict", path: "/" }),
      );
    });

    it("should set secure flag when environment is production", () => {
      mockConfigService.get.mockReturnValue("production");

      service.setTokens(mockRes, { token: "jwt_token", refreshToken: "refresh_token" });

      expect(mockSetCookie).toHaveBeenCalledWith(
        AUTH_COOKIES.ACCESS_TOKEN,
        "jwt_token",
        expect.objectContaining({ secure: true }),
      );
      expect(mockSetCookie).toHaveBeenCalledWith(
        AUTH_COOKIES.REFRESH_TOKEN,
        "refresh_token",
        expect.objectContaining({ secure: true }),
      );
    });
  });

  describe("clearTokens", () => {
    it("should clear all auth cookies when called", () => {
      service.clearTokens(mockRes);

      expect(mockClearCookie).toHaveBeenCalledWith(AUTH_COOKIES.ACCESS_TOKEN, { path: "/" });
      expect(mockClearCookie).toHaveBeenCalledWith(AUTH_COOKIES.REFRESH_TOKEN, { path: "/" });
      expect(mockClearCookie).toHaveBeenCalledWith(AUTH_COOKIES.SESSION, { path: "/" });
    });
  });
});
