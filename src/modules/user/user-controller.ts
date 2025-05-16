import { ForbiddenError } from '@casl/ability';
import { wrap } from '@mikro-orm/postgresql';
import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiResponse } from '../../lib/api-response.js';
import { type PatchUserSchema, type UserIdSchema } from './user-schemas.js';

export const getUserById = async (
  req: Request<UserIdSchema>,
  res: Response
) => {
  const { userId } = req.params;

  const user = await db.users.findOneOrFail(userId);

  ForbiddenError.from(req.ability).throwUnlessCan('read', user);

  res.json(ApiResponse.ok(user));
};

export const patchUserById = async (
  req: Request<UserIdSchema, unknown, PatchUserSchema>,
  res: Response
) => {
  const { userId } = req.params;

  const user = await db.users.findOneOrFail(userId);

  const forbiddenError = ForbiddenError.from(req.ability);

  Object.keys(req.body).forEach((field) =>
    forbiddenError.throwUnlessCan('update', user, field)
  );

  wrap(user).assign(req.body);

  await db.em.flush();

  res.json(ApiResponse.ok(user));
};

export const deleteUserById = async (
  req: Request<UserIdSchema>,
  res: Response
) => {
  const { userId } = req.params;

  const user = await db.users.findOneOrFail(userId);

  ForbiddenError.from(req.ability).throwUnlessCan('delete', user);

  await db.em.removeAndFlush(user);

  res.json(ApiResponse.ok(user));
};

// userRouter.post(
//   '/:userId/trainer-profile',
//   validateRequest({ params: userIdSchema, body: becomeTrainerSchema }),
//   authenticateRequest,
//   async (
//     req: Request<UserIdSchema, unknown, BecomeTrainerSchema>,
//     res: Response
//   ) => {
//     const { userId } = req.params;

//     const user = await db.users.findOneOrFail(userId);
//     ForbiddenError.from(req.ability).throwUnlessCan('read', user);

//     const trainer = db.trainers.create({ ...req.body, user });
//     ForbiddenError.from(req.ability).throwUnlessCan('create', trainer);

//     user.trainer = trainer;

//     await db.em.flush();

//     res.json(ApiResponse.ok(user));
//   }
// );
