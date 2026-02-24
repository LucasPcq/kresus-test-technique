import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { RefreshTokenRepository } from "./refresh-token.repository";

vi.mock("../common/utils/bcrypt.utils", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password"),
  comparePassword: vi.fn(),
}));

import { comparePassword, hashPassword } from "../common/utils/bcrypt.utils";

const mockUserService = {
  findByEmail: vi.fn(),
  create: vi.fn(),
};

const mockJwtService = {
  sign: vi.fn().mockReturnValue("jwt_token"),
};

const mockConfigService = {
  getOrThrow: vi.fn((key: string) => {
    if (key === "JWT_REFRESH_EXPIRES_IN") return "7d";
    if (key === "JWT_REFRESH_SECRET") return "refresh-secret";
    return "15m";
  }),
};

const mockRefreshTokenRepository = {
  create: vi.fn().mockResolvedValue({ id: "token-db-id", familyId: "family-id" }),
  findAndConsumeForRefresh: vi.fn(),
  revokeFamily: vi.fn(),
  revokeAllByUser: vi.fn(),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRefreshTokenRepository.create.mockResolvedValue({ id: "token-db-id", familyId: "family-id" });
    service = new AuthService(
      mockUserService as unknown as UserService,
      mockJwtService as unknown as JwtService,
      mockConfigService as unknown as ConfigService,
      mockRefreshTokenRepository as unknown as RefreshTokenRepository,
    );
  });

  describe("register", () => {
    it("should create user and return tokens when email is available", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({ id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" });

      const result = await service.register({ email: "test@example.com", password: "password123" });

      expect(mockUserService.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(hashPassword).toHaveBeenCalledWith("password123");
      expect(mockUserService.create).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "hashed_password",
      });
      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith({
        familyId: expect.any(String),
        userId: "550e8400-e29b-41d4-a716-446655440001",
        expiresAt: expect.any(Date),
      });
      expect(result).toEqual({
        token: "jwt_token",
        refreshToken: "jwt_token",
        user: { id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" },
      });
    });

    it("should throw ConflictException when email is already taken", async () => {
      mockUserService.findByEmail.mockResolvedValue({ id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" });

      await expect(
        service.register({ email: "test@example.com", password: "password123" }),
      ).rejects.toThrow(ConflictException);

      expect(mockUserService.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return tokens when credentials are valid", async () => {
      mockUserService.findByEmail.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "test@example.com",
        password: "hashed_password",
      });
      vi.mocked(comparePassword).mockResolvedValue(true as never);

      const result = await service.login({ email: "test@example.com", password: "password123" });

      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith({
        familyId: expect.any(String),
        userId: "550e8400-e29b-41d4-a716-446655440001",
        expiresAt: expect.any(Date),
      });
      expect(result).toEqual({
        token: "jwt_token",
        refreshToken: "jwt_token",
        user: { id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" },
      });
    });

    it("should throw UnauthorizedException when user is not found", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: "missing@example.com", password: "password123" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when password is incorrect", async () => {
      mockUserService.findByEmail.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "test@example.com",
        password: "hashed_password",
      });
      vi.mocked(comparePassword).mockResolvedValue(false as never);

      await expect(
        service.login({ email: "test@example.com", password: "wrong_password" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refresh", () => {
    it("should consume token atomically and return new tokens when token is valid", async () => {
      mockRefreshTokenRepository.findAndConsumeForRefresh.mockResolvedValue({
        token: {
          id: "old-jti",
          familyId: "family-123",
          revokedAt: null,
          userId: "550e8400-e29b-41d4-a716-446655440001",
        },
        reused: false,
      });

      const result = await service.refresh({
        sub: "550e8400-e29b-41d4-a716-446655440001",
        email: "test@example.com",
        familyId: "family-123",
        jti: "old-jti",
      });

      expect(mockRefreshTokenRepository.findAndConsumeForRefresh).toHaveBeenCalledWith("old-jti");
      expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ familyId: "family-123" }),
      );
      expect(result).toEqual({
        token: "jwt_token",
        refreshToken: "jwt_token",
        user: { id: "550e8400-e29b-41d4-a716-446655440001", email: "test@example.com" },
      });
    });

    it("should throw UnauthorizedException when token is not found", async () => {
      mockRefreshTokenRepository.findAndConsumeForRefresh.mockResolvedValue(null);

      await expect(
        service.refresh({ sub: "user-id", email: "test@example.com", familyId: "family-123", jti: "unknown-jti" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when reuse is detected", async () => {
      mockRefreshTokenRepository.findAndConsumeForRefresh.mockResolvedValue({
        token: {
          id: "stolen-jti",
          familyId: "family-123",
          revokedAt: new Date("2026-02-23"),
          userId: "550e8400-e29b-41d4-a716-446655440001",
        },
        reused: true,
      });

      await expect(
        service.refresh({
          sub: "550e8400-e29b-41d4-a716-446655440001",
          email: "test@example.com",
          familyId: "family-123",
          jti: "stolen-jti",
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockRefreshTokenRepository.create).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when token belongs to a different user", async () => {
      mockRefreshTokenRepository.findAndConsumeForRefresh.mockResolvedValue({
        token: {
          id: "valid-jti",
          familyId: "family-123",
          revokedAt: null,
          userId: "550e8400-e29b-41d4-a716-446655440001",
        },
        reused: false,
      });

      await expect(
        service.refresh({
          sub: "different-user-id",
          email: "attacker@example.com",
          familyId: "family-123",
          jti: "valid-jti",
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockRefreshTokenRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should revoke the token family when called", async () => {
      await service.logout("family-123");

      expect(mockRefreshTokenRepository.revokeFamily).toHaveBeenCalledWith("family-123");
    });
  });
});
