import { z } from 'zod';

export const createListSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'List name cannot be empty'),
  }),
});

export const updateListSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    order: z.number().positive().optional(),
  }),
});

export const listIdParamSchema = z.object({
  params: z.object({
    listId: z.string(),
  }),
});
