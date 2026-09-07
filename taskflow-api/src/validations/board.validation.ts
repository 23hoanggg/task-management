import { z } from 'zod';

export const createBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Board name cannot be empty'),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Board name cannot be empty').optional(),
    dueDate: z.coerce.date().optional().nullable(),
  }),
});

export const inviteUserSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
  }),
});