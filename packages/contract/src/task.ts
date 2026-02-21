import { z } from "zod";

export const PRIORITY = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

const priorityValues = Object.values(PRIORITY);

const taskBaseSchema = z.object({
  title: z.string().min(1).max(50),
  content: z.string().min(1).max(256),
  priority: z.enum(priorityValues),
  executionDate: z.iso.datetime().optional(),
  completed: z.boolean().optional().default(false),
});

export const createTaskSwaggerSchema = taskBaseSchema;

export const createTaskSchema = taskBaseSchema.extend({
  executionDate: z.iso
    .datetime()
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), {
      message: "Execution date must be in the future",
    })
    .optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;

const PAGE_SIZES = [10, 25, 50] as const;

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.literal(PAGE_SIZES).default(PAGE_SIZES[0]),
});

export type TaskQueryDto = z.infer<typeof taskQuerySchema>;

export const taskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  priority: z.enum(priorityValues),
  executionDate: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
});

export type TaskResponse = z.infer<typeof taskResponseSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
