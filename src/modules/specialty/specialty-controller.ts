import { ForbiddenError } from '@casl/ability';
import { type RequestHandler } from 'express';
import { db } from '../../database/database-client.js';
import { ApiError } from '../../lib/api-error.js';
import { ApiResponse } from '../../lib/api-response.js';
import { Specialty } from './specialty-entity.js';
import {
  type CreateSpecialtySchema,
  type SpecialtyIdSchema,
} from './specialty-schemas.js';

export const getSpecialties: RequestHandler = async (req, res) => {
  ForbiddenError.from(req.ability).throwUnlessCan('read', Specialty);

  const specialties = await db.specialties.findAll();

  res.json(ApiResponse.ok(specialties));
};

export const createSpecialty: RequestHandler<
  unknown,
  unknown,
  CreateSpecialtySchema
> = async (req, res) => {
  const { name } = req.body;

  ForbiddenError.from(req.ability).throwUnlessCan('create', Specialty);

  const count = await db.specialties.count({ name });
  if (count > 0) {
    throw ApiError.conflict(`"${name}" specialty already exists`);
  }

  const specialty = db.specialties.create(req.body);

  await db.em.flush();

  const response = ApiResponse.created(specialty);
  res.status(response.code).json(response);
};

export const deleteSpecialty: RequestHandler<SpecialtyIdSchema> = async (
  req,
  res
) => {
  const { specialtyId } = req.params;

  ForbiddenError.from(req.ability).throwUnlessCan('delete', Specialty);

  const specialty = await db.specialties.findOneOrFail(specialtyId);

  await db.em.removeAndFlush(specialty);

  res.json(ApiResponse.ok(specialty));
};
