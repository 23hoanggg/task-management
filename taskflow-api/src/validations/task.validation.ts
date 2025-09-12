import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task name cannot be empty'),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    assigneeId: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.coerce.date().optional().nullable(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    taskId: z.string(),
  }),
});
