import type { FilterQuery } from '@mikro-orm/core';
import type { Request, Response } from 'express';
import { DateTime, Interval } from 'luxon';
import { db } from '../../../database/database-client.js';
import { ResponseHandler } from '../../../lib/response-handler.js';
import { setTime, toInterval } from '../../../utils/date.js';
import { BookingStatus } from '../../booking/booking-entity.js';
import type { Trainer } from './trainer-entity.js';
import {
  type SlotSchema,
  type TrainerIdSchema,
  type TrainerPaginationParamSchema,
  type TrainerSlotsQueryParams,
} from './trainer-schemas.js';

export const getTrainers = async (
  req: Request<unknown, unknown, unknown, TrainerPaginationParamSchema>,
  res: Response
) => {
  const { page, limit, name, specialties } = req.query;

  const filter: FilterQuery<Trainer> = {};

  if (name) {
    filter.user = {
      $or: [{ firstName: { $ilike: name } }, { lastName: { $ilike: name } }],
    };
  }

  if (specialties) {
    filter.specialties = {
      name: { $in: specialties?.split(',') },
    };
  }

  const [trainers, totalItems] = await db.trainers.findAndCount(filter, {
    offset: (page - 1) * limit,
    limit,
    populate: ['user', 'specialties'],
  });

  return ResponseHandler.from(res).paginated(trainers, {
    page,
    limit,
    totalItems,
  });
};

export const getTrainerById = async (
  req: Request<TrainerIdSchema>,
  res: Response
) => {
  const trainer = await db.trainers.findOneOrFail(req.params.trainerId, {
    populate: ['user', 'specialties'],
  });

  return ResponseHandler.from(res).ok(trainer);
};

export const getTrainerSlots = async (
  req: Request<TrainerIdSchema, unknown, unknown, TrainerSlotsQueryParams>,
  res: Response
) => {
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

  // ForbiddenError.from(req.ability).throwUnlessCan('read', trainer);

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
    return ResponseHandler.from(res).ok([]);
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
  const slots: SlotSchema[] = [];
  for (const interval of freeIntervals) {
    let current = interval.start;

    while (current.plus({ minutes: sessionDuration }) <= interval.end) {
      slots.push({
        start: current.toUTC().toString(),
        end: current.plus({ minutes: sessionDuration }).toUTC().toString(),
      });

      current = current.plus({ minutes: sessionDuration });
    }
  }

  return ResponseHandler.from(res).ok(slots);
};
