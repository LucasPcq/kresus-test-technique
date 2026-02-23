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
};

describe("RefreshTokenRepository", () => {
  let repository: RefreshTokenRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new RefreshTokenRepository(mockPrisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("creates a refresh token with user connect", async () => {
      const input = {
        familyId: "550e8400-e29b-41d4-a716-446655440010",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        expiresAt: new Date("2026-03-01"),
      };
      const created = { id: "550e8400-e29b-41d4-a716-446655440020", ...input, revoked: false, createdAt: new Date() };
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
    it("returns the token when found", async () => {
      const token = { id: "550e8400-e29b-41d4-a716-446655440020", revoked: false };
      mockPrisma.refreshToken.findUnique.mockResolvedValue(token);

      const result = await repository.findById("550e8400-e29b-41d4-a716-446655440020");

      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { id: "550e8400-e29b-41d4-a716-446655440020" },
      });
      expect(result).toEqual(token);
    });

    it("returns null when not found", async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("revoke", () => {
    it("sets revoked to true for a single token", async () => {
      mockPrisma.refreshToken.update.mockResolvedValue({ id: "token-id", revoked: true });

      await repository.revoke("token-id");

      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "token-id" },
        data: { revoked: true },
      });
    });
  });

  describe("revokeFamily", () => {
    it("revokes all tokens in a family", async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      await repository.revokeFamily("family-id");

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: "family-id" },
        data: { revoked: true },
      });
    });
  });

  describe("revokeAllByUser", () => {
    it("revokes all tokens for a user", async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 5 });

      await repository.revokeAllByUser("user-id");

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-id" },
        data: { revoked: true },
      });
    });
  });

  describe("deleteExpired", () => {
    it("deletes all expired tokens", async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await repository.deleteExpired();

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: expect.any(Date) } },
      });
    });
  });
});
