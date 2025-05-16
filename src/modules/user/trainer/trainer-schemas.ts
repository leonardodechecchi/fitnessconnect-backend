import { DateTime } from 'luxon';
import { z } from 'zod';

export const trainerIdSchema = z.object({
  trainerId: z.string().uuid(),
});

export const getTrainerSlotSchema = z.object({
  date: z.string().date().openapi({ example: DateTime.now().toISODate() }),
});

export const slotSchema = z.object({
  start: z
    .string()
    .datetime()
    .openapi({
      example: DateTime.utc()
        .set({ hour: 15, minute: 0, second: 0, millisecond: 0 })
        .toISO(),
    }),
  end: z
    .string()
    .datetime()
    .openapi({
      example: DateTime.utc()
        .set({ hour: 16, minute: 0, second: 0, millisecond: 0 })
        .toISO(),
    }),
});

export const slotArraySchema = z.array(slotSchema);

export type TrainerIdSchema = z.infer<typeof trainerIdSchema>;
export type GetTrainerSlotsSchema = z.infer<typeof getTrainerSlotSchema>;
export type SlotSchema = z.infer<typeof slotSchema>;
export type SlotArraySchema = z.infer<typeof slotArraySchema>;
