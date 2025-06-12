import type { NextFunction, Request, Response } from 'express';
import { db } from '../database/database-client.js';
import { ErrorCode, ResponseHandler } from '../lib/response-handler.js';
import { AUTH } from '../modules/auth/auth-constants.js';
import { createAbility } from '../utils/casl.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { [AUTH.ACCESS_TOKEN_COOKIE_NAME]: accessToken } = req.cookies;

  if (!accessToken) {
    return ResponseHandler.from(res).unauthorized(
      ErrorCode.TokenNotFound,
      'Access token not provided'
    );
  }

  const { userId } = verifyAccessToken(accessToken);

  const user = await db.users.findOneOrFail(userId);

  const ability = createAbility(user);

  req.userId = userId;
  req.ability = ability;

  return next();
};
