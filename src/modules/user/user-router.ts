import { authenticate } from '../../middlewares/authenticate-request.js';
import { MagicRouter } from '../../openapi/magic-router.js';
import {
  deleteUserById,
  getUserById,
  patchUserById,
} from './user-controller.js';
import { patchUserSchema, userIdSchema } from './user-schemas.js';

export const USER_ROUTER_ROOT = '/users';

export const userRouter = new MagicRouter(USER_ROUTER_ROOT);

userRouter.get(
  '/:userId',
  { requestSchema: { params: userIdSchema } },
  authenticate,
  getUserById
);

userRouter.patch(
  '/:userId',
  { requestSchema: { params: userIdSchema, body: patchUserSchema } },
  authenticate,
  patchUserById
);

userRouter.delete(
  '/:userId',
  { requestSchema: { params: userIdSchema } },
  authenticate,
  deleteUserById
);
