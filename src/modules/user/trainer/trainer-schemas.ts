import { DateTime } from 'luxon';
import { z } from 'zod';

export const trainerIdSchema = z.object({
  trainerId: z.string().uuid(),
});

export const getTrainerSlotSchema = z.object({
  date: z.string().date().openapi({ example: DateTime.now().toISODate() }),
});

export const slotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const slotArraySchema = z.array(slotSchema);

export type TrainerIdSchema = z.infer<typeof trainerIdSchema>;
export type GetTrainerSlotsSchema = z.infer<typeof getTrainerSlotSchema>;
export type SlotSchema = z.infer<typeof slotSchema>;
export type SlotArraySchema = z.infer<typeof slotArraySchema>;
