import { Injectable } from "@nestjs/common";
import { CreateTaskDto } from "@kresus/contract";

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
}
