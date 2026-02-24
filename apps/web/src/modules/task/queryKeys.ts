import type { TaskQueryInput } from "@kresus/contract";

export const TASK_QUERY_KEYS = {
  all: ["tasks"] as const,
  lists: ["tasks", "list"] as const,
  infinites: ["tasks", "infinite"] as const,
  list: (params: TaskQueryInput) => ["tasks", "list", params],
  infinite: (params: TaskQueryInput) => ["tasks", "infinite", params],
} as const;
