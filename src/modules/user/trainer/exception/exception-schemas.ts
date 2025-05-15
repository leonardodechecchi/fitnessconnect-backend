import { DateTime } from 'luxon';
import { z } from 'zod';

export const createExceptionSchema = z
  .object({
    startDatetime: z.string().datetime({
      message: 'startDatetime must be a valid ISO 8601 datetime string',
    }),
    endDatetime: z.string().datetime({
      message: 'endDatetime must be a valid ISO 8601 datetime string',
    }),
    isAvailable: z.boolean(),
    reason: z.string().optional(),
  })
  .refine(
    (data) =>
      DateTime.fromISO(data.startDatetime) < DateTime.fromISO(data.endDatetime),
    {
      message: 'Start datetime must be before end datetime',
      path: ['endDatetime'],
    }
  );

export type CreateExceptionSchema = z.infer<typeof createExceptionSchema>;
