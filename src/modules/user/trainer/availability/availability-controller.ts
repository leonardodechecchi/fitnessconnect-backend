import type { Request, Response } from 'express';
import { Interval } from 'luxon';
import { db } from '../../../../database/database-client.js';
import {
  ErrorCode,
  ResponseHandler,
} from '../../../../lib/response-handler.js';
import { timeToDateTime } from '../../../../utils/date.js';
import type { TrainerIdSchema } from '../trainer-schemas.js';
import type { CreateAvailabilitySchema } from './availability-schemas.js';

export const getTrainerAvailabilities = async (
  req: Request<TrainerIdSchema>,
  res: Response
) => {
  const { trainerId } = req.params;

  const trainer = await db.trainers.findOneOrFail(trainerId, {
    populate: ['availabilities'],
  });

  return ResponseHandler.from(res).ok(trainer.availabilities.getItems());
};

export const createTrainerAvailability = async (
  req: Request<TrainerIdSchema, unknown, CreateAvailabilitySchema>,
  res: Response
) => {
  const { trainerId } = req.params;
  const { dayOfWeek, startTime, endTime } = req.body;

  const trainer = await db.trainers.findOneOrFail(trainerId, {
    populate: ['availabilities'],
    populateWhere: {
      availabilities: {
        dayOfWeek,
      },
    },
  });

  if (trainer.availabilities.count() >= 5) {
    return ResponseHandler.from(res).badRequest(
      ErrorCode.AccessDenied, // TODO: change
      'You cannot create more than 5 availabilities for the same day'
    );
  }

  // TODO: how does we handle adiacent intervals?
  for (const availability of trainer.availabilities) {
    const interval = Interval.fromDateTimes(
      timeToDateTime(availability.startTime),
      timeToDateTime(availability.endTime)
    );

    const other = Interval.fromDateTimes(
      timeToDateTime(startTime),
      timeToDateTime(endTime)
    );

    if (interval.overlaps(other)) {
      return ResponseHandler.from(res).badRequest(
        ErrorCode.AccessDenied, // TODO: change
        'The availability overlaps with an existing one'
      );
    }
  }

  const availability = db.availabilities.create({ ...req.body, trainer });
  await db.em.flush();

  return ResponseHandler.from(res).created(availability);
};
