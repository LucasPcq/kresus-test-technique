import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import {
  CreateTaskDto,
  PaginatedResponse,
  SORT_FIELDS,
  TaskQueryDto,
  TaskResponse,
  UpdateTaskDto,
} from "@kresus/contract";
import type { SortValue } from "@kresus/contract";

import { TaskRepository } from "./task.repository";

type TaskFilter = NonNullable<TaskQueryDto["filter"]>;

type PriorityFilter = NonNullable<TaskFilter["priority"]>;
type ExecutionDateFilter = NonNullable<TaskFilter["executionDate"]>;
type TitleFilter = NonNullable<TaskFilter["title"]>;

type OperatorFilter = PriorityFilter | ExecutionDateFilter | TitleFilter;

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
    const data: Prisma.TaskUpdateInput = {
      ...fields,
      ...(completed !== undefined && {
        completedAt: completed ? new Date() : null,
      }),
    };

    try {
      return await this.taskRepository.update({ id, userId }, data);
    } catch (error) {
      this.handlePrismaNotFound(error, id);
    }
  }

  async delete(id: string, userId: string) {
    try {
      return await this.taskRepository.delete({ id, userId });
    } catch (error) {
      this.handlePrismaNotFound(error, id);
    }
  }

  async batchDelete(ids: string[], userId: string) {
    return this.taskRepository.transaction(async (tx) => {
      const { count } = await this.taskRepository.deleteMany({ ids, userId }, tx);

      if (count !== ids.length) {
        throw new NotFoundException(
          `Some tasks were not found (expected ${ids.length}, deleted ${count})`,
        );
      }

      return { count };
    });
  }

  private handlePrismaNotFound(error: unknown, id: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new NotFoundException(`Task ${id} not found`);
    }
    throw error;
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

  private buildPriorityFilter(priority?: PriorityFilter): Prisma.TaskWhereInput {
    if (!priority) return {};

    const [operator, value] = this.extractOperator(priority);

    switch (operator) {
      case "eq":
        return { priority: { equals: value } };
      case "neq":
        return { priority: { not: value } };
      default:
        return {};
    }
  }

  private buildExecutionDateFilter(executionDate?: ExecutionDateFilter): Prisma.TaskWhereInput {
    if (!executionDate) return {};

    const [operator, value] = this.extractOperator(executionDate);

    if (Array.isArray(value)) {
      return { executionDate: { gte: value[0], lte: value[1] } };
    }

    switch (operator) {
      case "eq":
        return { executionDate: { equals: value } };
      case "neq":
        return { executionDate: { not: value } };
      case "gt":
        return { executionDate: { gt: value } };
      case "gte":
        return { executionDate: { gte: value } };
      case "lt":
        return { executionDate: { lt: value } };
      case "lte":
        return { executionDate: { lte: value } };
      default:
        return {};
    }
  }

  private buildTitleFilter(title?: TitleFilter): Prisma.TaskWhereInput {
    if (!title) return {};

    const [operator, value] = this.extractOperator(title);

    switch (operator) {
      case "eq":
        return { title: { equals: value, mode: "insensitive" } };
      case "neq":
        return { title: { not: value, mode: "insensitive" } };
      case "contains":
        return { title: { contains: value, mode: "insensitive" } };
      case "notContains":
        return { title: { not: { contains: value }, mode: "insensitive" } };
      case "startsWith":
        return { title: { startsWith: value, mode: "insensitive" } };
      default:
        return {};
    }
  }

  private extractOperator<T extends OperatorFilter>(
    filter: T,
  ): [keyof T & string, NonNullable<T[keyof T]>] {
    const entry = Object.entries(filter).find(([, value]) => value !== undefined);
    return entry as [keyof T & string, NonNullable<T[keyof T]>];
  }

  private parseSort(sort?: SortValue): Prisma.TaskOrderByWithRelationInput {
    if (!sort) return { createdAt: "desc" };

    for (const field of SORT_FIELDS) {
      if (sort === `-${field}`) return { [field]: "desc" };
      if (sort === field) return { [field]: "asc" };
    }

    return { createdAt: "desc" };
  }
}
