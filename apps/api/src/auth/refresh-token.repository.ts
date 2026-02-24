import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create({ familyId, userId, expiresAt }: { familyId: string; userId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({
      data: { familyId, expiresAt, user: { connect: { id: userId } } },
    });
  }

  findById(id: string) {
    return this.prisma.refreshToken.findUnique({ where: { id } });
  }

  revoke(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  revokeFamily(familyId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllByUser(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  findAndConsumeForRefresh(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const token = await tx.refreshToken.findUnique({ where: { id } });

      if (!token) return null;

      if (token.revokedAt) {
        await tx.refreshToken.updateMany({
          where: { familyId: token.familyId },
          data: { revokedAt: new Date() },
        });
        return { token, reused: true } as const;
      }

      await tx.refreshToken.update({
        where: { id },
        data: { revokedAt: new Date() },
      });
      return { token, reused: false } as const;
    });
  }

  deleteExpired() {
    return this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
