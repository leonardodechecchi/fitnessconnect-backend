import type { NextFunction, Request, Response } from 'express';
import { ErrorCode, ResponseHandler } from '../lib/response-handler.js';
import { AUTH } from '../modules/auth/auth-constants.js';
import { redis } from '../services/redis.js';
import { createAbilityFromRules } from '../utils/casl.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { [AUTH.ACCESS_TOKEN_COOKIE_NAME]: accessToken } = req.cookies;

  if (!accessToken) {
    return ResponseHandler.from(res).unauthorized(
      ErrorCode.TOKEN_NOT_FOUND,
      'Token not provided'
    );
  }

  const { userId } = verifyAccessToken(accessToken);

  // const user = await db.users.findOneOrFail(userId);
  // const ability = createAbility(user);

  const rules = await redis.get('rules', userId);

  if (!rules) {
    return ResponseHandler.from(res).unauthorized(
      ErrorCode.PERMISSION_NOT_FOUND,
      'Rules not found. Please sign in again'
    );
  }

  const ability = createAbilityFromRules(rules);

  req.userId = userId;
  req.ability = ability;

  return next();
};
