import { DateTime } from 'luxon';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().trim().min(8).max(64),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().email(),
  password: z.string().trim().min(8).max(64),
  timezone: z
    .string()
    .refine((timezone) => DateTime.local().setZone(timezone).isValid),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
