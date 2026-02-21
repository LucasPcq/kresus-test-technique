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

  findMany({
    where,
    skip,
    take,
    orderBy,
  }: {
    where: Prisma.TaskWhereInput;
    skip: number;
    take: number;
    orderBy: Prisma.TaskOrderByWithRelationInput;
  }) {
    return this.prisma.task.findMany({ where, skip, take, orderBy });
  }

  count(where: Prisma.TaskWhereInput) {
    return this.prisma.task.count({ where });
  }
}
