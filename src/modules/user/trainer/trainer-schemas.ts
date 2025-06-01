import type { DateTime } from 'luxon';
import { z } from 'zod';
import { userSchema } from '../user-schemas.js';

export const trainerSchema = z.object({
  user: userSchema,
  bio: z.string().optional(),
  sessionDuration: z.number(),
});

export const trainersSchema = z.array(trainerSchema);

export const trainerIdSchema = z.object({
  trainerId: z.string().uuid(),
});

export const getTrainerSlotSchema = z.object({
  date: z.string().date(),
});

export const slotSchema = z.object({
  start: z.custom<DateTime>(),
  end: z.custom<DateTime>(),
});

export type TrainerIdSchema = z.infer<typeof trainerIdSchema>;
export type GetTrainerSlotsSchema = z.infer<typeof getTrainerSlotSchema>;
export type SlotSchema = z.infer<typeof slotSchema>;
