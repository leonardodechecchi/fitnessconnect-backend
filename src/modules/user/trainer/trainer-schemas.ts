import { z } from 'zod';

export const trainerIdSchema = z.object({
  trainerId: z.string().uuid(),
});

export const getTrainerSlotSchema = z.object({
  date: z.string().date(),
});

export type TrainerIdSchema = z.infer<typeof trainerIdSchema>;
export type GetTrainerSlotsSchema = z.infer<typeof getTrainerSlotSchema>;
