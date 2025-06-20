import { ForbiddenError } from '@casl/ability';
import type { Request, Response } from 'express';
import { DateTime } from 'luxon';
import { db } from '../../../../database/database-client.js';
import {
  ErrorCode,
  ResponseHandler,
} from '../../../../lib/response-handler.js';
import type { TrainerIdSchema } from '../trainer-schemas.js';
import type { CreateExceptionSchema } from './exception-schemas.js';

export const getTrainerExceptions = async (
  req: Request<TrainerIdSchema>,
  res: Response
) => {
  const now = DateTime.now().toJSDate();

  const trainer = await db.trainers.findOneOrFail(req.params.trainerId, {
    populate: ['exceptions'],
    populateWhere: {
      exceptions: {
        startDatetime: { $gt: now },
      },
    },
  });

  Object.keys(trainer).forEach((field) =>
    ForbiddenError.from(req.ability).throwUnlessCan('read', trainer, field)
  );

  return ResponseHandler.from(res).ok(trainer.exceptions.getItems());
};

export const createTrainerException = async (
  req: Request<TrainerIdSchema, unknown, CreateExceptionSchema>,
  res: Response
) => {
  const { trainerId } = req.params;
  const { startDatetime, endDatetime } = req.body;

  const start = DateTime.fromISO(startDatetime).toJSDate();
  const end = DateTime.fromISO(endDatetime).toJSDate();

  const trainer = await db.trainers.findOneOrFail(trainerId, {
    populate: ['exceptions'],
    populateWhere: {
      exceptions: {
        startDatetime: { $lt: end },
        endDatetime: { $gt: start },
      },
    },
  });

  ForbiddenError.from(req.ability).throwUnlessCan('read', trainer);

  if (trainer.exceptions.length > 0) {
    return ResponseHandler.from(res).conflict(
      ErrorCode.CONFLICT,
      'The exception overlaps with an existing one'
    );
  }

  const exception = db.exceptions.create({ ...req.body, trainer });
  ForbiddenError.from(req.ability).throwUnlessCan('create', exception);

  await db.em.flush();

  return ResponseHandler.from(res).ok(exception);
};
