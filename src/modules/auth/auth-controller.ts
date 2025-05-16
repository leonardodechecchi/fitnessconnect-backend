import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiError } from '../../lib/api-error.js';
import { ApiResponse } from '../../lib/api-response.js';
import { redis } from '../../services/redis.js';
import {
  signAccessToken,
  verifyRefreshToken,
  type JwtPayload,
} from '../../utils/jwt.js';
import { AUTH } from './auth-constants.js';
import { type LoginSchema, type RegisterSchema } from './auth-schemas.js';
import { createAuthSession } from './auth-service.js';

export const getMe = async (req: Request, res: Response) => {
  const { userId } = req.tokenPayload;

  const user = await db.users.findOneOrFail(userId);

  res.json(ApiResponse.ok(user));
};

export const login = async (
  req: Request<unknown, unknown, LoginSchema>,
  res: Response
) => {
  const { email, password } = req.body;

  const user = await db.users.findOne({ email }, { populate: ['password'] });

  if (!user || !user.password || !(await user.verifyPassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  createAuthSession(res, user);

  res.json(ApiResponse.noContent('Login successful'));
};

export const register = async (
  req: Request<unknown, unknown, RegisterSchema>,
  res: Response
) => {
  const { email } = req.body;

  const userCount = await db.users.count({ email });
  if (userCount > 0) {
    throw ApiError.conflict('Email not available');
  }

  const user = db.users.create(req.body);

  await db.em.flush();

  const response = ApiResponse.created(user, 'Registration successful');

  res.status(response.code).json(response);
};

export const logout = async (req: Request, res: Response) => {
  const { [AUTH.REFRESH_TOKEN_COOKIE_NAME]: refreshToken } = req.cookies;

  const { exp } = verifyRefreshToken(refreshToken);

  const nowInSeconds = Math.floor(Date.now() / 1000);

  const timeToLive = exp! - nowInSeconds;
  if (timeToLive > 0) {
    await redis.set('blacklist', refreshToken, true, timeToLive);
  }

  res.clearCookie(AUTH.ACCESS_TOKEN_COOKIE_NAME, AUTH.COOKIE_OPTIONS);
  res.clearCookie(AUTH.REFRESH_TOKEN_COOKIE_NAME, AUTH.COOKIE_OPTIONS);

  res.json(ApiResponse.noContent('Logout successful'));
};

export const refresh = async (req: Request, res: Response) => {
  const { [AUTH.REFRESH_TOKEN_COOKIE_NAME]: refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized('Missing refresh token');
  }

  const isBlacklisted = await redis.get('blacklist', refreshToken);
  if (isBlacklisted) {
    throw ApiError.forbidden('Invalid or expired refresh token');
  }

  const { userId, userFullName } = verifyRefreshToken(refreshToken);

  const payload: JwtPayload = {
    userId,
    userFullName,
  };

  const accessToken = signAccessToken(payload);

  res.cookie(AUTH.ACCESS_TOKEN_COOKIE_NAME, accessToken, AUTH.COOKIE_OPTIONS);

  res.json(ApiResponse.noContent('Access token refreshed successfully'));
};
