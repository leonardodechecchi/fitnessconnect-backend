import { z } from 'zod';
import { timeToDateTime } from '../../../../utils/date.js';

export const availabilitySchema = z.object({
  id: z.string(),
  dayOfWeek: z.number(),
  startTime: z.string(),
  endTime: z.string(),
});

export const availabilityIdSchema = z.object({
  availabilityId: z.string().uuid(),
});

const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const createAvailabilitySchema = z
  .object({
    dayOfWeek: z
      .number()
      .min(0, {
        message: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)',
      })
      .max(6, {
        message: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)',
      }),
    startTime: z
      .string()
      .regex(TIME_REGEX, { message: 'startTime must be in the format HH:mm' }),
    endTime: z
      .string()
      .regex(TIME_REGEX, { message: 'endTime must be in the format HH:mm' }),
  })
  .refine(
    (data) => timeToDateTime(data.startTime) < timeToDateTime(data.endTime),
    {
      message: 'Start time must be before end time',
      path: ['endTime'],
    }
  );

export type AvailabilityIdSchema = z.infer<typeof availabilityIdSchema>;
export type CreateAvailabilitySchema = z.infer<typeof createAvailabilitySchema>;
