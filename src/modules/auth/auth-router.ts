import { z } from 'zod';
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
import {
  loginSchema,
  rawRuleArraySchema,
  registerSchema,
} from './auth-schemas.js';
import {
  facebookLogin,
  facebookLoginCallback,
  googleLogin,
  googleLoginCallback,
} from './oauth/oauth-controller.js';
import {
  facebookLoginSchema,
  googleLoginSchema,
} from './oauth/oauth-schemas.js';

export const authRouter = new SmartRouter('/auth');

authRouter.get(
  '/',
  {
    response: { schema: z.object({ isAuthenticated: z.boolean() }) },
  },
  checkAuth
);

authRouter.get(
  '/me',
  {
    response: { schema: userSchema },
  },
  authenticate,
  getMe
);

authRouter.post(
  '/login',
  {
    request: { body: loginSchema },
    response: { schema: rawRuleArraySchema },
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

authRouter.get(
  '/oauth/google',
  {
    request: { query: googleLoginSchema },
  },
  googleLogin
);

authRouter.get(
  '/oauth/google/callback',
  {
    // request: { query: googleLoginCallbackSchema },
  },
  googleLoginCallback
);

authRouter.get(
  '/oauth/facebook',
  {
    request: { query: facebookLoginSchema },
  },
  facebookLogin
);

authRouter.get(
  '/oauth/facebook/callback',
  {
    // request: { query: facebookLoginCbSchema },
  },
  facebookLoginCallback
);
