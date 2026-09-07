import { z } from 'zod';

export const createListSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'List name cannot be empty'),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateListSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().positive().optional(),
    dueDate: z.coerce.date().optional().nullable(),
  }),
});

export const listIdParamSchema = z.object({
  params: z.object({
    listId: z.string(),
  }),
});

export const reorderListsSchema = z.object({
  body: z.object({
    lists: z.array(
      z.object({
        _id: z.string(),
        order: z.number(),
      })
    ).min(1, 'Array of lists is required'),
  }),
});