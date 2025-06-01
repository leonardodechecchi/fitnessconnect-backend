import { wrap } from '@mikro-orm/core';
import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiResponse2 } from '../../lib/api-response.js';
import type { PaginationSchema } from '../common/common-schemas.js';
import { type PatchUserSchema, type UserIdSchema } from './user-schemas.js';

export const getUsers = async (
  req: Request<unknown, unknown, unknown, PaginationSchema>,
  res: Response
) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const [users, count] = await db.users.findAndCount(
    {},
    { offset: (page - 1) * limit, limit }
  );

  return ApiResponse2.from(res).paginated(users, page, limit, count);
};

export const getUserById = async (
  req: Request<UserIdSchema>,
  res: Response
) => {
  const { userId } = req.params;

  const user = await db.users.findOneOrFail(userId);

  return ApiResponse2.from(res).ok(user);
};

export const patchUserById = async (
  req: Request<UserIdSchema, unknown, PatchUserSchema>,
  res: Response
) => {
  const { userId } = req.params;

  const user = await db.users.findOneOrFail(userId);

  wrap(user).assign(req.body);

  await db.em.flush();

  return ApiResponse2.from(res).ok(user);
};

export const deleteUserById = async (
  req: Request<UserIdSchema>,
  res: Response
) => {
  const { userId } = req.params;

  const user = await db.users.findOneOrFail(userId);

  await db.em.removeAndFlush(user);

  return ApiResponse2.from(res).ok(user);
};

// userRouter.get(
//   '/:userId',
//   validateRequest({ params: userIdSchema }),
//   authenticateRequest,
//   async (req: Request<UserIdSchema>, res: Response) => {
//     const { userId } = req.params;

//     const user = await db.users.findOneOrFail(userId);
//     ForbiddenError.from(req.ability).throwUnlessCan('read', user);

//     res.json(ApiResponse.ok(user));
//   }
// );

// userRouter.patch(
//   '/:userId',
//   validateRequest({ params: userIdSchema, body: patchUserSchema }),
//   authenticateRequest,
//   async (
//     req: Request<UserIdSchema, unknown, PatchUserSchema>,
//     res: Response
//   ) => {
//     const { userId } = req.params;

//     const user = await db.users.findOneOrFail(userId);

//     Object.keys(req.body).forEach((field) =>
//       ForbiddenError.from(req.ability).throwUnlessCan('update', user, field)
//     );

//     wrap(user).assign(req.body);

//     await db.em.flush();

//     res.json(ApiResponse.ok(user));
//   }
// );

// userRouter.delete(
//   '/:userId',
//   validateRequest({ params: userIdSchema }),
//   authenticateRequest,
//   async (req: Request<UserIdSchema>, res: Response) => {
//     const { userId } = req.params;

//     const user = await db.users.findOneOrFail(userId);
//     ForbiddenError.from(req.ability).throwUnlessCan('delete', user);

//     await db.em.removeAndFlush(user);

//     res.json(ApiResponse.ok(user));
//   }
// );
