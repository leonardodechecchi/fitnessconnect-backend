import { DateTime } from 'luxon';
import { z } from 'zod';
import { specialtiesSchema } from '../../specialty/specialty-schemas.js';
import { userSchema } from '../user-schemas.js';

export const trainerSchema = z.object({
  user: userSchema,
  bio: z.string().optional(),
  sessionDuration: z.number(),
  specialties: specialtiesSchema,
});

export const trainersSchema = z.array(trainerSchema);

export const trainerIdSchema = z.object({
  trainerId: z.string().uuid(),
});

export const trainerSlotsQueryParams = z.object({
  date: z.string().date().openapi({ example: DateTime.now().toISODate() }),
});

export const slotSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export const slotArraySchema = z.array(slotSchema);

export type TrainerIdSchema = z.infer<typeof trainerIdSchema>;
export type SlotSchema = z.infer<typeof slotSchema>;
export type TrainerSlotsQueryParams = z.infer<typeof trainerSlotsQueryParams>;
