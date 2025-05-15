import type { Response } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  type JwtPayload,
} from '../../utils/jwt.js';
import type { User } from '../user/user-entity.js';
import { AUTH } from './auth-constants.js';

export const createAuthSession = (res: Response, user: User) => {
  const payload: JwtPayload = {
    userId: user.id,
    userFullName: user.fullName,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie(AUTH.ACCESS_TOKEN_COOKIE_NAME, accessToken, AUTH.COOKIE_OPTIONS);
  res.cookie(AUTH.REFRESH_TOKEN_COOKIE_NAME, refreshToken, AUTH.COOKIE_OPTIONS);
};
