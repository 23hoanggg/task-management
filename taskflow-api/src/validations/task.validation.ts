import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    boardId: z.string().min(1, 'Board ID is required to create a task'),
    title: z.string().min(1, 'Task name cannot be empty'),
    description: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(), 
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.coerce.date().optional().nullable(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    taskId: z.string(),
  }),
});

export const reorderTasksSchema = z.object({
  body: z.object({
    tasks: z.array(
      z.object({
        _id: z.string(),
        order: z.number(),
        listId: z.string(),
      })
    ).min(1, 'Array of tasks is required'),
  }),
});