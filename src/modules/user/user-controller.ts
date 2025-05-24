import { type Request, type Response } from 'express';
import type { PaginationSchema } from '../common/common-schemas.js';
import { type PatchUserSchema, type UserIdSchema } from './user-schemas.js';

export const getUsers = async (
  req: Request<unknown, unknown, unknown, PaginationSchema>,
  res: Response
) => {
  throw new Error('Method not implemented');
};

export const getUserById = async (
  req: Request<UserIdSchema>,
  res: Response
) => {
  throw new Error('Method not implemented');
};

export const patchUserById = async (
  req: Request<UserIdSchema, unknown, PatchUserSchema>,
  res: Response
) => {
  throw new Error('Method not implemented');
};

export const deleteUserById = async (
  req: Request<UserIdSchema>,
  res: Response
) => {
  throw new Error('Method not implemented');
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
