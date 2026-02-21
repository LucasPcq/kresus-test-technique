import type { TaskQueryDto } from "@kresus/contract";

export const TASK_QUERY_KEYS = {
  list: (params: TaskQueryDto) => ["tasks", "list", params],
  infinite: (params: TaskQueryDto) => ["tasks", "infinite", params],
} as const;
