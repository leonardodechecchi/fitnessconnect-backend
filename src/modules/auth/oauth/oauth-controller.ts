import { type Request, type Response } from 'express';
import { env } from '../../../config/env.js';
import { facebook } from '../../../services/facebook.js';
import { google } from '../../../services/google.js';

export const googleOAuthRedirect = async (_: Request, res: Response) => {
  const url = google.generateAuthUrl(env.CLIENT_SIDE_URL);
  res.redirect(url);
};

export const googleOAuthCallback = async (req: Request, res: Response) => {};

export const facebookOAuthRedirect = async (_: Request, res: Response) => {
  const url = facebook.generateAuthUrl(env.CLIENT_SIDE_URL);
  res.redirect(url);
};

export const facebookOAuthCallback = async (req: Request, res: Response) => {};

// oauthRouter.get(
//   '/google/callback',
//   validateRequest({ query: googleLoginCbSchema }),
//   async (
//     req: Request<unknown, unknown, unknown, GoogleLoginCbSchema>,
//     res: Response
//   ) => {
//     if ('error' in req.query) {
//       const { error, error_description } = req.query;

//       const message = error_description || 'Something went wrong';
//       const code = GOOGLE_ERRORS[error as keyof typeof GOOGLE_ERRORS] || 400;

//       throw new ApiError(code, message);
//     }

//     const { code, state } = req.query;
//     const { redirectUrl } = verifyStateToken(state);

//     const tokens = await google.getTokens(code);
//     const payload = await google.verifyIdToken(tokens.id_token);

//     let user = await db.users.findOne({ email: payload.email });
//     if (!user) {
//       user = db.users.create({
//         firstName: payload.given_name,
//         lastName: payload.family_name,
//         email: payload.email,
//         profilePictureUrl: payload.picture,
//         timezone: '',
//       });

//       await db.em.flush();
//     }

//     createAuthSession(res, user);

//     res.redirect(redirectUrl);
//   }
// );

// oauthRouter.get(
//   '/facebook/callback',
//   validateRequest({ query: facebookLoginCbSchema }),
//   async (
//     req: Request<unknown, unknown, unknown, FacebookLoginCbSchema>,
//     res: Response
//   ) => {
//     if ('error' in req.query) {
//       const { error, error_description } = req.query;

//       const message = error_description || 'Something went wrong';
//       const code =
//         FACEBOOK_ERRORS[error as keyof typeof FACEBOOK_ERRORS] || 400;

//       throw new ApiError(code, message);
//     }

//     const { state, code, granted_scopes } = req.query;
//     const { redirectUrl } = verifyStateToken(state);

//     const hasGrantedEmail = granted_scopes
//       .split(',')
//       .find((scope) => scope === 'email');

//     if (!hasGrantedEmail) {
//       throw ApiError.forbidden('Email permission is required');
//     }

//     const tokens = await facebook.getAccessToken(code);
//     const userProfile = await facebook.getUserProfileData(tokens.access_token);

//     let user = await db.users.findOne({ email: userProfile.email });
//     if (!user) {
//       user = db.users.create({
//         firstName: userProfile.first_name,
//         lastName: userProfile.last_name,
//         email: userProfile.email,
//         profilePictureUrl: userProfile.picture.data.url,
//       });

//       await db.em.flush();
//     }

//     createAuthSession(res, user);

//     res.redirect(redirectUrl);
//   }
// );
