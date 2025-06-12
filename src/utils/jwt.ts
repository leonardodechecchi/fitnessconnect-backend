import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { CustomError, ErrorCode } from '../lib/response-handler.js';

const { TokenExpiredError } = jwt;

export type JwtPayload = {
  userId: string;
  userFullName: string;
} & jwt.JwtPayload;

const handleTokenError = (error: unknown): never => {
  if (error instanceof TokenExpiredError) {
    throw new CustomError(401, ErrorCode.TOKEN_EXPIRED, 'Token expired');
  }

  throw new CustomError(401, ErrorCode.INVALID_TOKEN, 'Token invalid');
};

export type StateJwtPayload = {
  redirectUrl: string;
};

export const signAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    return handleTokenError(error);
  }
};

export const signRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL,
  });
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    return handleTokenError(error);
  }
};

export const signStateToken = (payload: StateJwtPayload) => {
  return jwt.sign(payload, env.STATE_TOKEN_SECRET, { expiresIn: 2 * 60 });
};

export const verifyStateToken = (token: string): StateJwtPayload => {
  try {
    return jwt.verify(token, env.STATE_TOKEN_SECRET) as StateJwtPayload;
  } catch (error) {
    return handleTokenError(error);
  }
};
