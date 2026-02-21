import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { CookieService } from "./cookie.service";

const mockAuthService = {
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
};

const mockCookieService = {
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
};

const mockRes = {} as Response;

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController(
      mockAuthService as unknown as AuthService,
      mockCookieService as unknown as CookieService,
    );
  });

  describe("register", () => {
    it("sets tokens and returns user info", async () => {
      const user = { id: "1", email: "test@example.com" };
      mockAuthService.register.mockResolvedValue({
        token: "jwt_token",
        refreshToken: "refresh_token",
        user,
      });

      const result = await controller.register(
        { email: "test@example.com", password: "password123" },
        mockRes,
      );

      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockCookieService.setTokens).toHaveBeenCalledWith(mockRes, {
        token: "jwt_token",
        refreshToken: "refresh_token",
      });
      expect(result).toEqual(user);
    });

    it("throws ZodError when body is invalid", async () => {
      await expect(
        controller.register({ email: "not-an-email", password: "short" }, mockRes),
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("sets tokens and returns user info", async () => {
      const user = { id: "1", email: "test@example.com" };
      mockAuthService.login.mockResolvedValue({
        token: "jwt_token",
        refreshToken: "refresh_token",
        user,
      });

      const result = await controller.login(
        { email: "test@example.com", password: "password123" },
        mockRes,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockCookieService.setTokens).toHaveBeenCalledWith(mockRes, {
        token: "jwt_token",
        refreshToken: "refresh_token",
      });
      expect(result).toEqual(user);
    });

    it("throws ZodError when body is invalid", async () => {
      await expect(
        controller.login({ email: "not-an-email", password: "" }, mockRes),
      ).rejects.toThrow();
    });
  });

  describe("me", () => {
    it("returns user info from JWT payload", () => {
      const req = { user: { sub: "1", email: "test@example.com" } } as unknown as Request;
      expect(controller.me(req)).toEqual({ id: "1", email: "test@example.com" });
    });
  });

  describe("logout", () => {
    it("clears all auth cookies", () => {
      controller.logout(mockRes);
      expect(mockCookieService.clearTokens).toHaveBeenCalledWith(mockRes);
    });
  });

  describe("refresh", () => {
    it("sets new tokens from refresh token payload", async () => {
      const payload = { sub: "1", email: "test@example.com" };
      mockAuthService.refresh.mockResolvedValue({
        token: "new_jwt",
        refreshToken: "new_refresh",
        user: { id: "1", email: "test@example.com" },
      });

      const req = { user: payload } as unknown as Request;
      await controller.refresh(req, mockRes);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(payload);
      expect(mockCookieService.setTokens).toHaveBeenCalledWith(mockRes, {
        token: "new_jwt",
        refreshToken: "new_refresh",
      });
    });
  });
});
