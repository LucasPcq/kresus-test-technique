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

export const PAGE_SIZES = [10, 25, 50] as const;

export const SORT_FIELDS = ["createdAt", "executionDate", "priority"] as const;
const sortRegex = new RegExp(`^-?(${SORT_FIELDS.join("|")})$`);

const singleOperator = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object(shape)
    .refine((obj) => Object.values(obj).filter((v) => v !== undefined).length <= 1, {
      message: "Only one operator allowed per filter field",
    })
    .optional();

const priorityFilterSchema = singleOperator({
  eq: z.enum(priorityValues).optional(),
  neq: z.enum(priorityValues).optional(),
});

const executionDateFilterSchema = singleOperator({
  eq: z.coerce.date().optional(),
  neq: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  between: z.tuple([z.coerce.date(), z.coerce.date()]).optional(),
});

const titleFilterSchema = singleOperator({
  eq: z.string().optional(),
  neq: z.string().optional(),
  contains: z.string().optional(),
  notContains: z.string().optional(),
  startsWith: z.string().optional(),
});

const taskFilterSchema = z
  .object({
    completed: z.coerce.number().pipe(z.literal([0, 1])).transform(Boolean).optional(),
    priority: priorityFilterSchema,
    executionDate: executionDateFilterSchema,
    title: titleFilterSchema,
  })
  .optional();

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().pipe(z.literal(PAGE_SIZES)).default(PAGE_SIZES[0]),
  sort: z.string().regex(sortRegex).default("-createdAt").optional(),
  filter: taskFilterSchema,
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
