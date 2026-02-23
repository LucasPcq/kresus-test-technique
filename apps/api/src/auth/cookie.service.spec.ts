import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyReply } from "fastify";
import { ConfigService } from "@nestjs/config";

import { CookieService } from "./cookie.service";

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
    it("sets access_token, refresh_token and session cookies", () => {
      service.setTokens(mockRes, { token: "jwt_token", refreshToken: "refresh_token" });

      expect(mockSetCookie).toHaveBeenCalledWith(
        "access_token",
        "jwt_token",
        expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
      );
      expect(mockSetCookie).toHaveBeenCalledWith(
        "refresh_token",
        "refresh_token",
        expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
      );
      expect(mockSetCookie).toHaveBeenCalledWith(
        "session",
        "1",
        expect.objectContaining({ sameSite: "strict", path: "/" }),
      );
    });

    it("sets secure flag in production", () => {
      mockConfigService.get.mockReturnValue("production");

      service.setTokens(mockRes, { token: "jwt_token", refreshToken: "refresh_token" });

      expect(mockSetCookie).toHaveBeenCalledWith(
        "access_token",
        "jwt_token",
        expect.objectContaining({ secure: true }),
      );
      expect(mockSetCookie).toHaveBeenCalledWith(
        "refresh_token",
        "refresh_token",
        expect.objectContaining({ secure: true }),
      );
    });
  });

  describe("clearTokens", () => {
    it("clears all auth cookies", () => {
      service.clearTokens(mockRes);

      expect(mockClearCookie).toHaveBeenCalledWith("access_token", { path: "/" });
      expect(mockClearCookie).toHaveBeenCalledWith("refresh_token", { path: "/" });
      expect(mockClearCookie).toHaveBeenCalledWith("session", { path: "/" });
    });
  });
});
