import { ForbiddenError } from '@casl/ability';
import type { Request, Response } from 'express';
import { db } from '../../database/database-client.js';
import { ErrorCode, ResponseHandler } from '../../lib/response-handler.js';
import type { PaginationParamSchema } from '../common/common-schemas.js';
import type {
  CreateSpecialtySchema,
  SpecialtyIdSchema,
} from './specialty-schemas.js';

export const getSpecialties = async (
  req: Request<unknown, unknown, unknown, PaginationParamSchema>,
  res: Response
) => {
  const { page, limit } = req.query;

  const [specialties, totalItems] = await db.specialties.findAndCount(
    {},
    { offset: (page - 1) * limit, limit }
  );

  specialties.forEach((specialty) =>
    ForbiddenError.from(req.ability).throwUnlessCan('read', specialty)
  );

  return ResponseHandler.from(res).paginated(specialties, {
    page,
    limit,
    totalItems,
  });
};

export const createSpecialty = async (
  req: Request<unknown, unknown, CreateSpecialtySchema>,
  res: Response
) => {
  const { name } = req.body;

  if ((await db.specialties.count({ name })) > 0) {
    return ResponseHandler.from(res).conflict(
      ErrorCode.CONFLICT,
      `"${name}" specialty already exists`
    );
  }

  const specialty = db.specialties.create(req.body);
  ForbiddenError.from(req.ability).throwUnlessCan('create', specialty);

  await db.em.flush();

  return ResponseHandler.from(res).created(specialty);
};

export const deleteSpecialty = async (
  req: Request<SpecialtyIdSchema>,
  res: Response
) => {
  const specialty = await db.specialties.findOneOrFail(req.params.specialtyId);
  ForbiddenError.from(req.ability).throwUnlessCan('delete', specialty);

  await db.em.removeAndFlush(specialty);

  return ResponseHandler.from(res).ok(specialty);
};
