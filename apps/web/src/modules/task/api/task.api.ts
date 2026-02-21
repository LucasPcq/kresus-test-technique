import type { PaginatedResponse, TaskQueryDto, TaskResponse } from "@kresus/contract";

import { apiClient } from "@/api/client";

export const fetchTasks = (params: TaskQueryDto): Promise<PaginatedResponse<TaskResponse>> =>
  apiClient.request<PaginatedResponse<TaskResponse>>("/tasks", { params });
