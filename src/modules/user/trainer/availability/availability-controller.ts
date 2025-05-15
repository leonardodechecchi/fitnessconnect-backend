import { ForbiddenError } from '@casl/ability';
import type { RequestHandler } from 'express';
import { Interval } from 'luxon';
import { db } from '../../../../database/database-client.js';
import { ApiError } from '../../../../lib/api-error.js';
import { ApiResponse } from '../../../../lib/api-response.js';
import type { TrainerIdSchema } from '../trainer-schemas.js';
import type { CreateAvailabilitySchema } from './availability-schemas.js';

export const getAvailabilities: RequestHandler<TrainerIdSchema> = async (
  req,
  res
) => {
  const { trainerId } = req.params;

  const trainer = await db.trainers.findOneOrFail(trainerId, {
    populate: ['availabilities'],
  });

  const forbidden = ForbiddenError.from(req.ability);

  Object.keys(trainer).forEach((field) =>
    forbidden.throwUnlessCan('read', trainer, field)
  );

  res.json(ApiResponse.ok(trainer.availabilities.getItems()));
};

export const createAvailability: RequestHandler<
  TrainerIdSchema,
  unknown,
  CreateAvailabilitySchema
> = async (req, res) => {
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
    throw ApiError.badRequest(
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
      throw ApiError.badRequest(
        'The availability overlaps with an existing one'
      );
    }
  }

  const availability = db.availabilities.create({ ...req.body, trainer });
  ForbiddenError.from(req.ability).throwUnlessCan('create', availability);

  await db.em.flush();

  const response = ApiResponse.created(availability);
  res.status(response.code).json(response);
};
function timeToDateTime(startTime: string): import('luxon').DateInput {
  throw new Error('Function not implemented.');
}
