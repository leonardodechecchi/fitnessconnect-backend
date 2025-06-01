import { SmartRouter } from '../../openapi/smart-router.js';
import { paginationSchema } from '../common/common-schemas.js';
import {
  deleteUserById,
  getUserById,
  getUsers,
  patchUserById,
} from './user-controller.js';
import {
  patchUserSchema,
  userIdSchema,
  userSchema,
  usersSchema,
} from './user-schemas.js';

export const userRouter = new SmartRouter('/users');

userRouter.get(
  '/',
  {
    request: { query: paginationSchema },
    response: usersSchema,
  },
  getUsers
);

userRouter.get(
  '/:userId',
  {
    request: { params: userIdSchema },
    response: userSchema,
  },
  getUserById
);

userRouter.patch(
  '/:userId',
  {
    request: { params: userIdSchema, body: patchUserSchema },
    response: userSchema,
  },
  patchUserById
);

userRouter.delete(
  '/:userId',
  {
    request: { params: userIdSchema },
    response: userSchema,
  },
  deleteUserById
);
