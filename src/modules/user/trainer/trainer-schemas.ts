import { z } from 'zod';
import { userSchema } from '../user-schemas.js';

export const trainerSchema = z.object({
  user: userSchema,
});

export const trainerIdSchema = z.object({
  trainerId: z.string().uuid(),
});

export const getTrainerSlotSchema = z.object({
  date: z.string().date(),
});

export const slotSchema = z.object({
  // TODO
});

export type TrainerIdSchema = z.infer<typeof trainerIdSchema>;
export type GetTrainerSlotsSchema = z.infer<typeof getTrainerSlotSchema>;
