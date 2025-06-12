import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ErrorCode, ResponseHandler } from '../../lib/response-handler.js';
import { redis } from '../../services/redis.js';
import {
  signAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
  type JwtPayload,
} from '../../utils/jwt.js';
import { AUTH } from './auth-constants.js';
import { type LoginSchema, type RegisterSchema } from './auth-schemas.js';
import { createAuthSession } from './auth-service.js';

export const checkAuth = (req: Request, res: Response) => {
  const { [AUTH.ACCESS_TOKEN_COOKIE_NAME]: accessToken } = req.cookies;
  const isAuthenticated = verifyAccessToken(accessToken);
  return ResponseHandler.from(res).ok(!!isAuthenticated);
};

export const getMe = async (req: Request, res: Response) => {
  const user = await db.users.findOneOrFail(req.userId);
  return ResponseHandler.from(res).ok(user);
};

export const login = async (
  req: Request<unknown, unknown, LoginSchema>,
  res: Response
) => {
  const { email, password } = req.body;

  const user = await db.users.findOne({ email }, { populate: ['password'] });

  if (!user || !user.password || !(await user.verifyPassword(password))) {
    return ResponseHandler.from(res).unauthorized(
      ErrorCode.UNAUTHORIZED,
      'Invalid email or password'
    );
  }

  createAuthSession(res, user);

  return ResponseHandler.from(res).noData('Login successful');
};

export const register = async (
  req: Request<unknown, unknown, RegisterSchema>,
  res: Response
) => {
  const { email } = req.body;

  if ((await db.users.count({ email })) > 0) {
    return ResponseHandler.from(res).conflict(
      ErrorCode.CONFLICT,
      'Email not available'
    );
  }

  const user = db.users.create(req.body);
  await db.em.flush();

  return ResponseHandler.from(res).ok(user, 'Registration successful');
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

  return ResponseHandler.from(res).noData();
};

export const refresh = async (req: Request, res: Response) => {
  const { [AUTH.REFRESH_TOKEN_COOKIE_NAME]: refreshToken } = req.cookies;

  if (!refreshToken) {
    return ResponseHandler.from(res).unauthorized(
      ErrorCode.TOKEN_NOT_FOUND,
      'Token not found'
    );
  }

  const isBlacklisted = await redis.get('blacklist', refreshToken);
  if (isBlacklisted) {
    return ResponseHandler.from(res).unauthorized(ErrorCode.UNAUTHORIZED);
  }

  const { userId, userFullName } = verifyRefreshToken(refreshToken);

  const payload: JwtPayload = {
    userId,
    userFullName,
  };

  const accessToken = signAccessToken(payload);

  res.cookie(AUTH.ACCESS_TOKEN_COOKIE_NAME, accessToken, AUTH.COOKIE_OPTIONS);

  return ResponseHandler.from(res).noData();
};
