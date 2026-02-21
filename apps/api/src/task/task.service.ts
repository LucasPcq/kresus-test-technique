import { Injectable } from "@nestjs/common";
import { CreateTaskDto, PaginatedResponse, TaskQueryDto, TaskResponse } from "@kresus/contract";

import { TaskRepository } from "./task.repository";

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

  async findAll({ page, pageSize }: TaskQueryDto, userId: string): Promise<PaginatedResponse<TaskResponse>> {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.taskRepository.findByUserId(userId, { skip, take: pageSize }),
      this.taskRepository.countByUserId(userId),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
