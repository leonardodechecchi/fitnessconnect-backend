import { ForbiddenError } from '@casl/ability';
import { type RequestHandler } from 'express';
import { DateTime, Interval } from 'luxon';
import { db } from '../../../database/database-client.js';
import { ApiResponse } from '../../../lib/api-response.js';
import { setTime, toInterval } from '../../../utils/date.js';
import { BookingStatus } from '../../booking/booking-entity.js';
import {
  type GetTrainerSlotsSchema,
  type TrainerIdSchema,
} from './trainer-schemas.js';

export const getTrainer: RequestHandler<TrainerIdSchema> = async (req, res) => {
  const { trainerId } = req.params;

  const trainer = await db.trainers.findOneOrFail(trainerId, {
    populate: ['user'],
  });

  ForbiddenError.from(req.ability).throwUnlessCan('read', trainer);

  res.json(trainer);
};

type Slot = {
  start: DateTime;
  end: DateTime;
};

export const getTrainerSlots: RequestHandler<
  TrainerIdSchema,
  unknown,
  unknown,
  GetTrainerSlotsSchema
> = async (req, res): Promise<any> => {
  const targetDate = DateTime.fromISO(req.query.date, { zone: 'utc' });

  const dayInterval = Interval.fromDateTimes(
    targetDate.startOf('day'),
    targetDate.plus({ days: 1 }).startOf('day')
  );

  const trainer = await db.trainers.findOneOrFail(req.params.trainerId, {
    populate: ['user', 'availabilities', 'exceptions'],
    populateWhere: {
      availabilities: {
        dayOfWeek: targetDate.weekday % 7,
      },
      exceptions: {
        startDatetime: { $lt: dayInterval.end.toJSDate() },
        endDatetime: { $gt: dayInterval.start.toJSDate() },
      },
    },
  });

  ForbiddenError.from(req.ability).throwUnlessCan('read', trainer);

  const timezone = trainer.user.$.timezone;
  const sessionDuration = trainer.sessionDuration;
  const availabilities = trainer.availabilities.$;
  const exceptions = trainer.exceptions.$;

  const bookings = await db.bookings.find({
    trainer,
    status: BookingStatus.CONFIRMED,
    startDatetime: { $lt: dayInterval.end.toJSDate() },
    endDatetime: { $gt: dayInterval.start.toJSDate() },
  });

  const availableExceptions = exceptions.filter((e) => e.isAvailable);
  const unavailableExceptions = exceptions.filter((e) => !e.isAvailable);

  if (availabilities.length === 0 && availableExceptions.length === 0) {
    return res.json(ApiResponse.ok([]));
  }

  // Intervalli disponibili (availabilities + eccezioni disponibili)
  const availableIntervals = Interval.merge([
    ...availabilities.map(({ startTime, endTime }) =>
      Interval.fromDateTimes(
        setTime(targetDate, startTime, timezone),
        setTime(targetDate, endTime, timezone)
      )
    ),
    ...availableExceptions.map((exception) =>
      toInterval(exception.startDatetime, exception.endDatetime, timezone)
    ),
  ]);

  // Intervalli da rimuovere (eccezioni non disponibili + prenotazioni)
  const blockedIntervals = [
    ...unavailableExceptions.map((exception) =>
      toInterval(exception.startDatetime, exception.endDatetime, timezone)
    ),
    ...bookings.map((booking) =>
      toInterval(booking.startDatetime, booking.endDatetime, timezone)
    ),
  ];

  // Differenza tra disponibili e bloccati
  const freeIntervals: Interval[] = [];
  for (const interval of availableIntervals) {
    freeIntervals.push(...interval.difference(...blockedIntervals));
  }

  // Generazione degli slot
  const slots: Slot[] = [];
  for (const interval of freeIntervals) {
    let current = interval.start;

    while (current.plus({ minutes: sessionDuration }) <= interval.end) {
      slots.push({
        start: current.toUTC(),
        end: current.plus({ minutes: sessionDuration }).toUTC(),
      });

      current = current.plus({ minutes: sessionDuration });
    }
  }

  res.json(ApiResponse.ok(slots));
};
