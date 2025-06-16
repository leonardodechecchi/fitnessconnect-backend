import { ForbiddenError } from '@casl/ability';
import { wrap } from '@mikro-orm/core';
import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ResponseHandler } from '../../lib/response-handler.js';
import type { PaginationParamSchema } from '../common/common-schemas.js';
import { type PatchUserSchema, type UserIdSchema } from './user-schemas.js';

export const getUsers = async (
  req: Request<unknown, unknown, unknown, PaginationParamSchema>,
  res: Response
) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const [users, totalItems] = await db.users.findAndCount(
    {},
    { offset: (page - 1) * limit, limit }
  );

  users.forEach((user) =>
    ForbiddenError.from(req.ability).throwUnlessCan('read', user)
  );

  return ResponseHandler.from(res).paginated(users, {
    page,
    limit,
    totalItems,
  });
};

export const getUserById = async (
  req: Request<UserIdSchema>,
  res: Response
) => {
  const user = await db.users.findOneOrFail(req.params.userId);
  ForbiddenError.from(req.ability).throwUnlessCan('read', user);

  return ResponseHandler.from(res).ok(user);
};

export const patchUserById = async (
  req: Request<UserIdSchema, unknown, PatchUserSchema>,
  res: Response
) => {
  const user = await db.users.findOneOrFail(req.params.userId);
  ForbiddenError.from(req.ability).throwUnlessCan('update', user);

  wrap(user).assign(req.body);

  await db.em.flush();

  return ResponseHandler.from(res).ok(user);
};

export const deleteUserById = async (
  req: Request<UserIdSchema>,
  res: Response
) => {
  const user = await db.users.findOneOrFail(req.params.userId);
  ForbiddenError.from(req.ability).throwUnlessCan('delete', user);

  await db.em.removeAndFlush(user);

  return ResponseHandler.from(res).ok(user);
};
