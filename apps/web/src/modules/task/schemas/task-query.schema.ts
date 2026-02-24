import { z } from "zod";

import { dateFilterOps, priorityFilterOps, priorityValues, taskQuerySchema } from "@kresus/contract";

import { PAGINATION_MODE, PAGINATION_MODES } from "../task.constants";

export const taskQueryURLSchema = taskQuerySchema.omit({ filter: true }).extend({
  mode: z.enum(PAGINATION_MODES).default(PAGINATION_MODE.CLASSIC),
  priority: z.enum(priorityValues).optional(),
  priorityOp: z.enum(priorityFilterOps).default("eq"),
  title: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  dateOp: z.enum(dateFilterOps).default("between"),
  completed: z.coerce
    .number()
    .pipe(z.literal([0, 1]))
    .transform(Boolean)
    .optional(),
});

export type TaskQueryURL = z.infer<typeof taskQueryURLSchema>;

export const parseTaskQueryURL = (query: Record<string, unknown>) => {
  const result = taskQueryURLSchema.safeParse(query);
  if (result.success) return result.data;
  return taskQueryURLSchema.parse({});
};
