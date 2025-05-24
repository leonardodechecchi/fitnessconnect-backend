import { Router, type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiError } from '../../lib/api-error.js';
import { ApiResponse } from '../../lib/api-response.js';
import { authenticateRequest } from '../../middlewares/authenticate-request.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { redis } from '../../services/redis.js';
import {
  signAccessToken,
  verifyRefreshToken,
  type JwtPayload,
} from '../../utils/jwt.js';
import { AUTH } from './auth-constants.js';
import {
  loginSchema,
  registerSchema,
  type LoginSchema,
  type RegisterSchema,
} from './auth-schemas.js';
import { createAuthSession } from './auth-service.js';
import { oauthRouter } from './oauth/oauth-controller.js';

export const authRouter = Router();

export const getMe = async (req: Request, res: Response) => {
  throw new Error('Method not implemented');
};

export const login = async (req: Request, res: Response) => {
  throw new Error('Method not implemented');
};

export const register = async (req: Request, res: Response) => {
  throw new Error('Method not implemented');
};

export const logout = async (req: Request, res: Response) => {
  throw new Error('Method not implemented');
};

export const refresh = async (req: Request, res: Response) => {
  throw new Error('Method not implemented');
};

authRouter.get(
  '/me',
  authenticateRequest,
  async (req: Request, res: Response) => {
    const user = await db.users.findOneOrFail(req.userId);

    res.json(ApiResponse.ok(user));
  }
);

authRouter.post(
  '/login',
  validateRequest({ body: loginSchema }),
  async (req: Request<unknown, unknown, LoginSchema>, res: Response) => {
    const { email, password } = req.body;

    const user = await db.users.findOne({ email }, { populate: ['password'] });

    if (!user || !user.password || !(await user.verifyPassword(password))) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.isBanned()) {
      throw ApiError.forbidden('Your account has been banned');
    }

    createAuthSession(res, user);

    res.json(ApiResponse.noContent('Login successfull'));
  }
);

authRouter.post(
  '/register',
  validateRequest({ body: registerSchema }),
  async (req: Request<unknown, unknown, RegisterSchema>, res: Response) => {
    const { email } = req.body;

    const userCount = await db.users.count({ email });
    if (userCount > 0) {
      throw ApiError.conflict('Email not available');
    }

    const user = db.users.create(req.body);

    await db.em.flush();

    res.json(ApiResponse.created(user, 'Registration successfull'));
  }
);

authRouter.post('/logout', async (req: Request, res: Response) => {
  const { [AUTH.REFRESH_TOKEN_COOKIE_NAME]: refreshToken } = req.cookies;

  const { exp } = verifyRefreshToken(refreshToken);

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const timeToLive = exp! - nowInSeconds;

  if (timeToLive > 0) {
    await redis.set('blacklist', refreshToken, true, timeToLive);
  }

  res.clearCookie(AUTH.ACCESS_TOKEN_COOKIE_NAME, AUTH.COOKIE_OPTIONS);
  res.clearCookie(AUTH.REFRESH_TOKEN_COOKIE_NAME, AUTH.COOKIE_OPTIONS);

  res.json(ApiResponse.noContent());
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const { [AUTH.REFRESH_TOKEN_COOKIE_NAME]: refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token not provided');
  }

  const isBlacklisted = await redis.get('blacklist', refreshToken);
  if (isBlacklisted) {
    throw ApiError.forbidden('Refresh token rejected');
  }

  const { userId, userFullName } = verifyRefreshToken(refreshToken);

  const payload: JwtPayload = {
    userId,
    userFullName,
  };

  const accessToken = signAccessToken(payload);

  res.cookie(AUTH.ACCESS_TOKEN_COOKIE_NAME, accessToken, AUTH.COOKIE_OPTIONS);

  res.json(ApiResponse.noContent());
});

authRouter.use('/oauth', oauthRouter);
