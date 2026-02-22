import type {
  CreateTaskInput,
  PaginatedResponse,
  TaskQueryDto,
  TaskResponse,
  UpdateTaskDto,
} from "@kresus/contract";

import { apiClient } from "@/api/client";

export const fetchTasks = (params: TaskQueryDto): Promise<PaginatedResponse<TaskResponse>> =>
  apiClient.request<PaginatedResponse<TaskResponse>>("/tasks", { params });

export const createTask = (dto: CreateTaskInput): Promise<TaskResponse> =>
  apiClient.request<TaskResponse>("/tasks", {
    method: "POST",
    body: JSON.stringify(dto),
  });

export const updateTask = ({ id, ...dto }: UpdateTaskDto & { id: string }): Promise<TaskResponse> =>
  apiClient.request<TaskResponse>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });

export const deleteTask = (id: string): Promise<void> =>
  apiClient.request<void>(`/tasks/${id}`, { method: "DELETE" });

export const batchDeleteTasks = (ids: string[]): Promise<{ count: number }> =>
  apiClient.request<{ count: number }>("/tasks/batch-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
