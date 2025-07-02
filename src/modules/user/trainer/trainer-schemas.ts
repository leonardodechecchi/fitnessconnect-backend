import { DateTime } from 'luxon';
import { z } from 'zod';
import { paginationParamSchema } from '../../common/common-schemas.js';
import { userSchema } from '../user-schemas.js';

export const trainerSchema = z.object({
  user: userSchema,
  bio: z.string().optional(),
  sessionDuration: z.number(),
});

export const trainerArraySchema = z.array(trainerSchema);

export const trainerIdSchema = z.object({
  trainerId: z.string().uuid(),
});

export const trainerSlotsQueryParams = z.object({
  date: z.string().date().openapi({ example: DateTime.now().toISODate() }),
});

export const trainerPaginationParamSchema = paginationParamSchema.extend({
  name: z.string().optional(),
  specialties: z.string().optional(),
});

export const slotSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export const slotArraySchema = z.array(slotSchema);

export type TrainerIdSchema = z.infer<typeof trainerIdSchema>;
export type SlotSchema = z.infer<typeof slotSchema>;
export type TrainerSlotsQueryParams = z.infer<typeof trainerSlotsQueryParams>;
export type TrainerPaginationParamSchema = z.infer<
  typeof trainerPaginationParamSchema
>;
