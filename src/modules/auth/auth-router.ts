import { authenticate } from '../../middlewares/authenticate-request.js';
import { MagicRouter } from '../../openapi/magic-router.js';
import { getMe, login, logout, refresh, register } from './auth-controller.js';
import { loginSchema, registerSchema } from './auth-schemas.js';
import {
  facebookOAuthCallback,
  facebookOAuthRedirect,
  googleOAuthCallback,
  googleOAuthRedirect,
} from './oauth/oauth-controller.js';

export const AUTH_ROUTER_ROOT = '/auth';

export const authRouter = new MagicRouter(AUTH_ROUTER_ROOT);

authRouter.post('/login', { requestSchema: { body: loginSchema } }, login);

authRouter.post(
  '/register',
  { requestSchema: { body: registerSchema } },
  register
);

authRouter.post('/logout', {}, logout);

authRouter.post('/refresh', {}, refresh);

authRouter.get('/me', {}, authenticate, getMe);

authRouter.get('/oauth/google', {}, googleOAuthRedirect);

authRouter.get('/oauth/google/callback', {}, googleOAuthCallback);

authRouter.get('/oauth/facebook', {}, facebookOAuthRedirect);

authRouter.get('/oauth/google/callback', {}, facebookOAuthCallback);
