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
    return ResponseHandler.from(res).conflict(
      ErrorCode.CONFLICT,
      'You cannot create more than 5 availabilities for the same day'
    );
  }

  const targetAvailability = Interval.fromDateTimes(
    timeToDateTime(startTime),
    timeToDateTime(endTime)
  );

  // TODO: how does we handle adiacent intervals?
  for (const availability of trainer.availabilities) {
    const existingAvailability = Interval.fromDateTimes(
      timeToDateTime(availability.startTime),
      timeToDateTime(availability.endTime)
    );

    if (existingAvailability.overlaps(targetAvailability)) {
      return ResponseHandler.from(res).conflict(
        ErrorCode.CONFLICT,
        'The availability overlaps with an existing one'
      );
    }
  }

  const availability = db.availabilities.create({ ...req.body, trainer });
  await db.em.flush();

  return ResponseHandler.from(res).created(availability);
};
