import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import {
  CreateTaskDto,
  PaginatedResponse,
  Priority,
  TaskQueryDto,
  TaskResponse,
  UpdateTaskDto,
} from "@kresus/contract";

import { TaskRepository } from "./task.repository";

type TaskFilter = NonNullable<TaskQueryDto["filter"]>;

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  create({ completed, ...dto }: CreateTaskDto, userId: string) {
    return this.taskRepository.create({
      ...dto,
      completedAt: completed ? new Date() : null,
      userId,
    });
  }

  async findAll(
    { page, pageSize, sort, filter }: TaskQueryDto,
    userId: string,
  ): Promise<PaginatedResponse<TaskResponse>> {
    const skip = (page - 1) * pageSize;
    const where = this.buildWhere(userId, filter);
    const orderBy = this.parseSort(sort);

    const [items, total] = await Promise.all([
      this.taskRepository.findMany({ where, skip, take: pageSize, orderBy }),
      this.taskRepository.count(where),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async update(id: string, { completed, ...fields }: UpdateTaskDto, userId: string) {
    await this.verifyOwnership(id, userId);

    const data: Prisma.TaskUpdateInput = {
      ...fields,
      ...(completed !== undefined && {
        completedAt: completed ? new Date() : null,
      }),
    };

    return this.taskRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.verifyOwnership(id, userId);
    return this.taskRepository.delete(id);
  }

  async batchDelete(ids: string[], userId: string) {
    const tasks = await this.taskRepository.findManyByIds(ids);

    const notFoundIds = ids.filter((id) => !tasks.some((t) => t.id === id));
    if (notFoundIds.length > 0) {
      throw new NotFoundException(`Tasks not found: ${notFoundIds.join(", ")}`);
    }

    const notOwned = tasks.filter((t) => t.userId !== userId);
    if (notOwned.length > 0) {
      throw new ForbiddenException("You do not own all the requested tasks");
    }

    return this.taskRepository.deleteMany(ids);
  }

  private async verifyOwnership(id: string, userId: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    if (task.userId !== userId) throw new ForbiddenException("You do not own this task");
    return task;
  }

  private buildWhere(userId: string, filter?: TaskFilter): Prisma.TaskWhereInput {
    if (!filter) return { userId };

    return {
      userId,
      ...this.buildCompletedFilter(filter.completed),
      ...this.buildPriorityFilter(filter.priority),
      ...this.buildExecutionDateFilter(filter.executionDate),
      ...this.buildTitleFilter(filter.title),
    };
  }

  private buildCompletedFilter(completed?: boolean): Prisma.TaskWhereInput {
    if (completed === undefined) return {};
    return { completedAt: completed ? { not: null } : null };
  }

  private buildPriorityFilter(
    priority?: NonNullable<TaskFilter["priority"]>,
  ): Prisma.TaskWhereInput {
    if (!priority) return {};

    const [operator, value] = this.extractOperator(priority);

    switch (operator) {
      case "eq":
        return { priority: { equals: value as Priority } };
      case "neq":
        return { priority: { not: value as Priority } };
      default:
        return {};
    }
  }

  private buildExecutionDateFilter(
    executionDate?: NonNullable<TaskFilter["executionDate"]>,
  ): Prisma.TaskWhereInput {
    if (!executionDate) return {};

    const [operator, value] = this.extractOperator(executionDate);

    switch (operator) {
      case "eq":
        return { executionDate: { equals: value as Date } };
      case "neq":
        return { executionDate: { not: value as Date } };
      case "gt":
        return { executionDate: { gt: value as Date } };
      case "gte":
        return { executionDate: { gte: value as Date } };
      case "lt":
        return { executionDate: { lt: value as Date } };
      case "lte":
        return { executionDate: { lte: value as Date } };
      case "between": {
        const [from, to] = value as [Date, Date];
        return { executionDate: { gte: from, lte: to } };
      }
      default:
        return {};
    }
  }

  private buildTitleFilter(title?: NonNullable<TaskFilter["title"]>): Prisma.TaskWhereInput {
    if (!title) return {};

    const [operator, value] = this.extractOperator(title);

    switch (operator) {
      case "eq":
        return { title: { equals: value as string, mode: "insensitive" } };
      case "neq":
        return { title: { not: value as string, mode: "insensitive" } };
      case "contains":
        return { title: { contains: value as string, mode: "insensitive" } };
      case "notContains":
        return { title: { not: { contains: value as string }, mode: "insensitive" } };
      case "startsWith":
        return { title: { startsWith: value as string, mode: "insensitive" } };
      default:
        return {};
    }
  }

  // TODO: Type return as [keyof T, T[keyof T]] to remove `as` casts in filter builders
  private extractOperator<T extends Record<string, unknown>>(filter: T): [string, unknown] {
    const entry = Object.entries(filter).find(([, v]) => v !== undefined);
    return entry ?? ["", undefined];
  }

  private parseSort(sort?: string): Prisma.TaskOrderByWithRelationInput {
    if (!sort) return { createdAt: "desc" };
    const desc = sort.startsWith("-");
    const field = desc ? sort.slice(1) : sort;
    return { [field]: desc ? "desc" : "asc" };
  }
}
