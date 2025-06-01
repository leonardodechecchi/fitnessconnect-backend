import { ForbiddenError } from '@casl/ability';
import type { RequestHandler } from 'express';
import { db } from '../database/database-client.js';
import { ApiError } from '../lib/api-error.js';
import { AUTH } from '../modules/auth/auth-constants.js';
import { createAbility } from '../utils/casl.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticateRequest: RequestHandler = async (req, _, next) => {
  const { [AUTH.ACCESS_TOKEN_COOKIE_NAME]: accessToken } = req.cookies;

  if (!accessToken) {
    throw ApiError.unauthorized('Access token not provided');
  }

  const { userId } = verifyAccessToken(accessToken);

  const user = await db.users.findOneOrFail(userId);

  if (user.isBanned()) {
    throw ApiError.forbidden('Your account has been banned');
  }

  const ability = createAbility(user);

  req.userId = userId;
  req.ability = ability;
  req.forbidden = ForbiddenError.from(req.ability);

  next();
};

export const authenticate: RequestHandler = async (req, _, next) => {
  const { [AUTH.ACCESS_TOKEN_COOKIE_NAME]: accessToken } = req.cookies;

  if (!accessToken) {
    throw ApiError.unauthorized('Access token not provided');
  }

  const { userId } = verifyAccessToken(accessToken);

  const user = await db.users.findOneOrFail(userId);

  if (user.isBanned()) {
    throw ApiError.forbidden('Your account has been banned');
  }

  const ability = createAbility(user);

  req.userId = userId;
  req.ability = ability;
  req.forbidden = ForbiddenError.from(req.ability);

  next();
};
