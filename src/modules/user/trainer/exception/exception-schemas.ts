import type { Ref } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { z } from 'zod';
import type { Trainer } from '../trainer-entity.js';

export interface ExceptionShape {
  id: string;
  startDatetime: Date;
  endDatetime: Date;
  isAvailable: boolean;
  reason?: string;
  trainer: Ref<Trainer>;
}

export const exceptionSchema: z.ZodSchema<ExceptionShape> = z.object({
  id: z.string(),
  startDatetime: z.date(),
  endDatetime: z.date(),
  isAvailable: z.boolean(),
  reason: z.string().optional(),
  trainer: z.custom<Ref<Trainer>>(),
});

export const exceptionArraySchema = z.array(exceptionSchema);

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
