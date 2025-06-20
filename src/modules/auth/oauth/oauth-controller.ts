import { type Request, type Response } from 'express';
import { env } from '../../../config/env.js';
import { db } from '../../../database/database-client.js';
import { CustomError, ErrorCode } from '../../../lib/response-handler.js';
import { facebook, FACEBOOK_ERRORS } from '../../../services/facebook.js';
import { google, GOOGLE_ERRORS } from '../../../services/google.js';
import { verifyStateToken } from '../../../utils/jwt.js';
import { createAuthSession } from '../auth-service.js';
import {
  type FacebookLoginCbSchema,
  type FacebookLoginSchema,
  type GoogleLoginCbSchema,
  type GoogleLoginSchema,
} from './oauth-schemas.js';

export const googleLogin = (
  req: Request<unknown, unknown, unknown, GoogleLoginSchema>,
  res: Response
) => {
  const redirectUrl = req.query.redirectUrl || env.CLIENT_SIDE_URL;
  const url = google.generateAuthUrl(redirectUrl);

  return res.redirect(url);
};

export const googleLoginCallback = async (
  req: Request<unknown, unknown, unknown, GoogleLoginCbSchema>,
  res: Response
) => {
  if ('error' in req.query) {
    const { error, error_description } = req.query;

    const message = error_description || 'Something went wrong';
    const statusCode =
      GOOGLE_ERRORS[error as keyof typeof GOOGLE_ERRORS] ?? 400;

    throw new CustomError(statusCode, ErrorCode.OAUTH_ERROR, message);
  }

  const { code, state } = req.query;
  const { redirectUrl } = verifyStateToken(state);

  const tokens = await google.getTokens(code);
  const payload = await google.verifyIdToken(tokens.id_token);

  let user = await db.users.findOne({ email: payload.email });
  if (!user) {
    user = db.users.create({
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      profilePictureUrl: payload.picture,
      timezone: '',
    });

    await db.em.flush();
  }

  createAuthSession(res, user);

  res.redirect(redirectUrl);
};

export const facebookLogin = (
  req: Request<unknown, unknown, unknown, FacebookLoginSchema>,
  res: Response
) => {
  const redirectUrl = req.query.redirectUrl || env.CLIENT_SIDE_URL;
  const url = facebook.generateAuthUrl(redirectUrl);

  res.redirect(url);
};

export const facebookLoginCallback = async (
  req: Request<unknown, unknown, unknown, FacebookLoginCbSchema>,
  res: Response
) => {
  if ('error' in req.query) {
    const { error, error_description } = req.query;

    const message = error_description || 'Something went wrong';
    const statusCode =
      FACEBOOK_ERRORS[error as keyof typeof FACEBOOK_ERRORS] ?? 400;

    throw new CustomError(statusCode, ErrorCode.OAUTH_ERROR, message);
  }

  const { state, code, granted_scopes } = req.query;
  const { redirectUrl } = verifyStateToken(state);

  const hasGrantedEmail = granted_scopes
    .split(',')
    .find((scope) => scope === 'email');

  if (!hasGrantedEmail) {
    throw new CustomError(
      403,
      ErrorCode.FORBIDDEN,
      'Email permission is required'
    );
  }

  const tokens = await facebook.getAccessToken(code);
  const userProfile = await facebook.getUserProfileData(tokens.access_token);

  let user = await db.users.findOne({ email: userProfile.email });
  if (!user) {
    user = db.users.create({
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      email: userProfile.email,
      profilePictureUrl: userProfile.picture.data.url,
      timezone: '',
    });

    await db.em.flush();
  }

  createAuthSession(res, user);

  res.redirect(redirectUrl);
};
