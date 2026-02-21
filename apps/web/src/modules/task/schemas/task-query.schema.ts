import { z } from "zod";

import { priorityValues, taskQuerySchema } from "@kresus/contract";

import { PAGINATION_MODES } from "../task.constants";

export const taskQueryURLSchema = taskQuerySchema.omit({ filter: true }).extend({
  mode: z.enum(PAGINATION_MODES).default("classic"),
  priority: z.enum(priorityValues).optional(),
  title: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  completed: z.coerce
    .number()
    .pipe(z.literal([0, 1]))
    .transform(Boolean)
    .optional(),
});

export type TaskQueryURL = z.infer<typeof taskQueryURLSchema>;

export const TASK_QUERY_URL_KEYS = [
  "completed",
  "priority",
  "title",
  "dateFrom",
  "dateTo",
] as const satisfies Array<keyof TaskQueryURL>;

export const parseTaskQueryURL = (query: Record<string, unknown>) => {
  const result = taskQueryURLSchema.safeParse(query);
  if (result.success) return result.data;
  return taskQueryURLSchema.parse({});
};
