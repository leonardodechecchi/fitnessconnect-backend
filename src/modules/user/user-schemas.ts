import { DateTime } from 'luxon';
import { z } from 'zod';
import { UserStatus } from './user-entity.js';

export const userIdSchema = z.object({
  userId: z.string().uuid(),
});

export const patchUserSchema = z
  .object({
    status: z.nativeEnum(UserStatus),
    timezone: z
      .string()
      .refine((timezone) => DateTime.local().setZone(timezone).isValid),
  })
  .partial();

export const becomeTrainerSchema = z.object({
  bio: z.string().optional(),
  sessionDuration: z.number().positive(),
});

export type UserIdSchema = z.infer<typeof userIdSchema>;
export type PatchUserSchema = z.infer<typeof patchUserSchema>;
export type BecomeTrainerSchema = z.infer<typeof becomeTrainerSchema>;
