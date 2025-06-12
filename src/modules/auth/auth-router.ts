import { authenticate } from '../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../openapi/smart-router.js';
import { userSchema } from '../user/user-schemas.js';
import {
  checkAuth,
  getMe,
  login,
  logout,
  refresh,
  register,
} from './auth-controller.js';
import { loginSchema, registerSchema } from './auth-schemas.js';

export const authRouter = new SmartRouter('/auth');

authRouter.get('/', {}, checkAuth);

authRouter.get(
  '/me',
  {
    response: userSchema,
  },
  authenticate,
  getMe
);

authRouter.post(
  '/login',
  {
    request: { body: loginSchema },
  },
  login
);

authRouter.post(
  '/register',
  {
    request: { body: registerSchema },
  },
  register
);

authRouter.post('/logout', {}, logout);

authRouter.post('/refresh', {}, refresh);
