import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "../prisma/prisma.service";
import { RefreshTokenRepository } from "./refresh-token.repository";

const mockPrisma = {
  refreshToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe("RefreshTokenRepository", () => {
  let repository: RefreshTokenRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((callback: (tx: typeof mockPrisma) => unknown) => callback(mockPrisma));
    repository = new RefreshTokenRepository(mockPrisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("should create a refresh token with user connect when called", async () => {
      const input = {
        familyId: "550e8400-e29b-41d4-a716-446655440010",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        expiresAt: new Date("2026-03-01"),
      };
      const created = { id: "550e8400-e29b-41d4-a716-446655440020", ...input, revokedAt: null, createdAt: new Date() };
      mockPrisma.refreshToken.create.mockResolvedValue(created);

      const result = await repository.create(input);

      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          familyId: input.familyId,
          expiresAt: input.expiresAt,
          user: { connect: { id: input.userId } },
        },
      });
      expect(result).toEqual(created);
    });
  });

  describe("findById", () => {
    it("should return the token when found", async () => {
      const token = { id: "550e8400-e29b-41d4-a716-446655440020", revokedAt: null };
      mockPrisma.refreshToken.findUnique.mockResolvedValue(token);

      const result = await repository.findById("550e8400-e29b-41d4-a716-446655440020");

      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { id: "550e8400-e29b-41d4-a716-446655440020" },
      });
      expect(result).toEqual(token);
    });

    it("should return null when token is not found", async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("revoke", () => {
    it("should set revokedAt when called with token id", async () => {
      mockPrisma.refreshToken.update.mockResolvedValue({ id: "token-id", revokedAt: new Date() });

      await repository.revoke("token-id");

      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "token-id" },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe("revokeFamily", () => {
    it("should revoke all tokens in a family when called", async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      await repository.revokeFamily("family-id");

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: "family-id" },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe("revokeAllByUser", () => {
    it("should revoke all tokens for a user when called", async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 5 });

      await repository.revokeAllByUser("user-id");

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-id" },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe("findAndConsumeForRefresh", () => {
    it("should return null when token is not found", async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      const result = await repository.findAndConsumeForRefresh("nonexistent");

      expect(result).toBeNull();
      expect(mockPrisma.refreshToken.update).not.toHaveBeenCalled();
      expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });

    it("should revoke token and return reused=false when token is valid", async () => {
      const token = { id: "token-id", familyId: "family-id", revokedAt: null, userId: "user-id" };
      mockPrisma.refreshToken.findUnique.mockResolvedValue(token);
      mockPrisma.refreshToken.update.mockResolvedValue({ ...token, revokedAt: new Date() });

      const result = await repository.findAndConsumeForRefresh("token-id");

      expect(result).toEqual({ token, reused: false });
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "token-id" },
        data: { revokedAt: expect.any(Date) },
      });
      expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });

    it("should revoke entire family and return reused=true when token was already revoked", async () => {
      const token = { id: "token-id", familyId: "family-id", revokedAt: new Date(), userId: "user-id" };
      mockPrisma.refreshToken.findUnique.mockResolvedValue(token);

      const result = await repository.findAndConsumeForRefresh("token-id");

      expect(result).toEqual({ token, reused: true });
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: "family-id" },
        data: { revokedAt: expect.any(Date) },
      });
      expect(mockPrisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it("should execute within a transaction when called", async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await repository.findAndConsumeForRefresh("token-id");

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("deleteExpired", () => {
    it("should delete all expired tokens when called", async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await repository.deleteExpired();

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: expect.any(Date) } },
      });
    });
  });
});
