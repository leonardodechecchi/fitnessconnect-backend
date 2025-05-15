import type { CookieOptions } from 'express';
import { env } from '../../config/env.js';

type AuthConstant = {
  ACCESS_TOKEN_COOKIE_NAME: string;
  REFRESH_TOKEN_COOKIE_NAME: string;
  COOKIE_OPTIONS: CookieOptions;
};

const clientSideUrl = new URL(env.CLIENT_SIDE_URL);

export const AUTH: AuthConstant = {
  ACCESS_TOKEN_COOKIE_NAME: 'accessToken',
  REFRESH_TOKEN_COOKIE_NAME: 'refreshToken',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    domain: clientSideUrl.hostname,
  },
};
