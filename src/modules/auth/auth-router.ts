import { SmartRouter } from '../../openapi/smart-router.js';
import { getMe, login, logout, refresh, register } from './auth-controller.js';
import { loginSchema, registerSchema } from './auth-schemas.js';

export const authRouter = new SmartRouter('/auth');

authRouter.get('/me', {}, getMe);

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
