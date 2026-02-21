import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  create({ userId, ...data }: Prisma.TaskUncheckedCreateInput) {
    return this.prisma.task.create({
      data: { ...data, user: { connect: { id: userId as string } } },
    });
  }

  findByUserId(userId: string, { skip, take }: { skip: number; take: number }) {
    return this.prisma.task.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  countByUserId(userId: string) {
    return this.prisma.task.count({ where: { userId } });
  }
}
