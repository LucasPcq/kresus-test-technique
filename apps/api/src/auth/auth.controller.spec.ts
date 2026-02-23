import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";

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

const mockRes = {} as unknown as FastifyReply;

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
      const user = { id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
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
  });

  describe("login", () => {
    it("sets tokens and returns user info", async () => {
      const user = { id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
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
  });

  describe("me", () => {
    it("returns user info from JWT payload", () => {
      const req = { user: { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" } } as unknown as FastifyRequest;
      expect(controller.me(req)).toEqual({ id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" });
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
      const payload = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" };
      mockAuthService.refresh.mockResolvedValue({
        token: "new_jwt",
        refreshToken: "new_refresh",
        user: { id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" },
      });

      const req = { user: payload } as unknown as FastifyRequest;
      await controller.refresh(req, mockRes);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(payload);
      expect(mockCookieService.setTokens).toHaveBeenCalledWith(mockRes, {
        token: "new_jwt",
        refreshToken: "new_refresh",
      });
    });
  });
});
