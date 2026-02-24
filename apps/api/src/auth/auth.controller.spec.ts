import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyReply } from "fastify";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { CookieService } from "./cookie.service";

const mockAuthService = {
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
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
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com", familyId: "family-123" };
      expect(controller.me(user)).toEqual({ id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" });
    });
  });

  describe("logout", () => {
    it("revokes the token family and clears cookies", async () => {
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com", familyId: "family-123" };

      await controller.logout(user, mockRes);

      expect(mockAuthService.logout).toHaveBeenCalledWith("family-123");
      expect(mockCookieService.clearTokens).toHaveBeenCalledWith(mockRes);
    });
  });

  describe("refresh", () => {
    it("sets new tokens from refresh token payload", async () => {
      const user = { sub: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com", familyId: "family-123", jti: "token-jti" };
      mockAuthService.refresh.mockResolvedValue({
        token: "new_jwt",
        refreshToken: "new_refresh",
        user: { id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" },
      });

      await controller.refresh(user, mockRes);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(user);
      expect(mockCookieService.setTokens).toHaveBeenCalledWith(mockRes, {
        token: "new_jwt",
        refreshToken: "new_refresh",
      });
    });
  });
});
