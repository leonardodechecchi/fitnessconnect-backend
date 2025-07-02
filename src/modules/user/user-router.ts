import { authenticate } from '../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../openapi/smart-router.js';
import { paginationParamSchema } from '../common/common-schemas.js';
import {
  deleteUserById,
  getUserById,
  getUsers,
  patchUserById,
} from './user-controller.js';
import {
  patchUserSchema,
  userArraySchema,
  userIdSchema,
  userSchema,
} from './user-schemas.js';

export const userRouter = new SmartRouter('/users');

userRouter.get(
  '/',
  {
    request: { query: paginationParamSchema },
    response: {
      schema: userArraySchema,
      options: { enablePagination: true },
    },
  },
  authenticate,
  getUsers
);

userRouter.get(
  '/:userId',
  {
    request: { params: userIdSchema },
    response: { schema: userSchema },
  },
  authenticate,
  getUserById
);

userRouter.patch(
  '/:userId',
  {
    request: { params: userIdSchema, body: patchUserSchema },
    response: { schema: userSchema },
  },
  authenticate,
  patchUserById
);

userRouter.delete(
  '/:userId',
  {
    request: { params: userIdSchema },
    response: { schema: userSchema },
  },
  authenticate,
  deleteUserById
);
