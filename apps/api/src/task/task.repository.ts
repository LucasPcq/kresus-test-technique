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

  findById(id: string) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  update({ id, userId }: { id: string; userId: string }, data: Prisma.TaskUpdateInput) {
    return this.prisma.task.update({ where: { id, userId }, data });
  }

  delete({ id, userId }: { id: string; userId: string }) {
    return this.prisma.task.delete({ where: { id, userId } });
  }

  deleteMany({ ids, userId }: { ids: string[]; userId: string }, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.task.deleteMany({ where: { id: { in: ids }, userId } });
  }

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
