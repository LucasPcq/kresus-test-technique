import type { TaskQueryInput } from "@kresus/contract";

export const TASK_QUERY_KEYS = {
  list: (params: TaskQueryInput) => ["tasks", "list", params],
  infinite: (params: TaskQueryInput) => ["tasks", "infinite", params],
} as const;
