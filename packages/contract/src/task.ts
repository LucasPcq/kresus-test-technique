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
