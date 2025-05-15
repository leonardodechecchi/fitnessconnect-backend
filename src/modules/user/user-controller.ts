import { ForbiddenError } from '@casl/ability';
import { wrap } from '@mikro-orm/postgresql';
import { Router, type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiResponse } from '../../lib/api-response.js';
import { authenticateRequest } from '../../middlewares/authenticate-request.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { User } from './user-entity.js';
import {
  becomeTrainerSchema,
  patchUserSchema,
  userIdSchema,
  type BecomeTrainerSchema,
  type PatchUserSchema,
  type UserIdSchema,
} from './user-schemas.js';

export const userRouter = Router();

userRouter.get('/', (req: Request, res: Response) => {
  // TODO: check
  ForbiddenError.from(req.ability).throwUnlessCan('read', User);

  // TODO: implementation

  throw new Error('Not implemented yet');
});

userRouter.get(
  '/:userId',
  validateRequest({ params: userIdSchema }),
  authenticateRequest,
  async (req: Request<UserIdSchema>, res: Response) => {
    const { userId } = req.params;

    const user = await db.users.findOneOrFail(userId);
    ForbiddenError.from(req.ability).throwUnlessCan('read', user);

    res.json(ApiResponse.ok(user));
  }
);

userRouter.patch(
  '/:userId',
  validateRequest({ params: userIdSchema, body: patchUserSchema }),
  authenticateRequest,
  async (
    req: Request<UserIdSchema, unknown, PatchUserSchema>,
    res: Response
  ) => {
    const { userId } = req.params;

    const user = await db.users.findOneOrFail(userId);

    Object.keys(req.body).forEach((field) =>
      ForbiddenError.from(req.ability).throwUnlessCan('update', user, field)
    );

    wrap(user).assign(req.body);

    await db.em.flush();

    res.json(ApiResponse.ok(user));
  }
);

userRouter.delete(
  '/:userId',
  validateRequest({ params: userIdSchema }),
  authenticateRequest,
  async (req: Request<UserIdSchema>, res: Response) => {
    const { userId } = req.params;

    const user = await db.users.findOneOrFail(userId);
    ForbiddenError.from(req.ability).throwUnlessCan('delete', user);

    await db.em.removeAndFlush(user);

    res.json(ApiResponse.ok(user));
  }
);

userRouter.post(
  '/:userId/trainer-profile',
  validateRequest({ params: userIdSchema, body: becomeTrainerSchema }),
  authenticateRequest,
  async (
    req: Request<UserIdSchema, unknown, BecomeTrainerSchema>,
    res: Response
  ) => {
    const { userId } = req.params;

    const user = await db.users.findOneOrFail(userId);
    ForbiddenError.from(req.ability).throwUnlessCan('read', user);

    const trainer = db.trainers.create({ ...req.body, user });
    ForbiddenError.from(req.ability).throwUnlessCan('create', trainer);

    user.trainer = trainer;

    await db.em.flush();

    res.json(ApiResponse.ok(user));
  }
);
