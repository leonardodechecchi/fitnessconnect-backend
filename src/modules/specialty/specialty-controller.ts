import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiError } from '../../lib/api-error.js';
import { ApiResponse } from '../../lib/api-response.js';
import {
  type CreateSpecialtySchema,
  type GetSpecialtySchema,
  type SpecialtyIdSchema,
} from './specialty-schemas.js';

export const getSpecialties = async (
  req: Request<unknown, unknown, unknown, GetSpecialtySchema>,
  res: Response
) => {
  const { page, limit, name } = req.query;

  const specialties = await db.specialties.find(
    { ...(name ? { name } : {}) },
    { offset: (page - 1) * limit, limit }
  );

  res.json(ApiResponse.ok(specialties));
};

export const createSpecialty = async (
  req: Request<unknown, unknown, CreateSpecialtySchema>,
  res: Response
) => {
  const { name } = req.body;

  const count = await db.specialties.count({ name });
  if (count > 0) {
    throw ApiError.conflict(`"${name}" specialty already exists`);
  }

  const specialty = db.specialties.create(req.body);

  await db.em.flush();

  const response = ApiResponse.created(specialty);
  res.status(response.code).json(response);
};

export const deleteSpecialty = async (
  req: Request<SpecialtyIdSchema>,
  res: Response
) => {
  const { specialtyId } = req.params;

  const specialty = await db.specialties.findOneOrFail(specialtyId);

  await db.em.removeAndFlush(specialty);

  res.json(ApiResponse.ok(specialty));
};
