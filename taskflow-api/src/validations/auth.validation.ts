import { email, z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name cannot be empty"),

    email: z.string().min(1, "Email is required").email("Invalid email format"),

    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(1, "Password must be at least 6 characters long"),
  }),
});
