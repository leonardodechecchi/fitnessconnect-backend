import { gaxios, OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../lib/api-error.js';
import { signStateToken } from '../utils/jwt.js';

export const GOOGLE_ERRORS = {
  invalid_grant: 400,
  unauthorized_client: 401,
  access_denied: 403,
  unsupported_response_type: 400,
  invalid_scope: 400,
  server_error: 500,
  temporarily_unavailable: 503,
} as const;

const googleCredentialSchema = z.object({
  access_token: z.string(),
  id_token: z.string(),
  refresh_token: z.string().optional(),
});

const googleTokenPayloadSchema = z.object({
  iss: z.string(),
  at_hash: z.string().optional(),
  email_verified: z.boolean().optional(),
  sub: z.string(),
  email: z.string(),
  profile: z.string().optional(),
  picture: z.string().optional(),
  name: z.string().optional(),
  given_name: z.string(),
  family_name: z.string(),
  aud: z.string(),
  iat: z.number(),
  exp: z.number(),
  nonce: z.string().optional(),
  hd: z.string().optional(),
  locale: z.string().optional(),
});

class GoogleService {
  readonly #client: OAuth2Client;

  constructor() {
    this.#client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URL
    );
  }

  static #handleError(error: unknown): never {
    if (error instanceof gaxios.GaxiosError) {
      if (error.response) {
        const message = error.response.statusText;
        const code = error.response.status;

        throw new ApiError(code, message);
      }

      throw ApiError.serviceUnavailable('Unable to reach Google servers');
    }

    throw ApiError.internalError(
      'An unexpected error occurred while communicating with Google'
    );
  }

  generateAuthUrl(redirectUrl: string): string {
    const state = signStateToken({ redirectUrl });

    return this.#client.generateAuthUrl({
      // access_type: 'online',
      prompt: 'select_account',
      scope: ['profile', 'email'],
      state,
    });
  }

  async getTokens(
    authCode: string
  ): Promise<z.infer<typeof googleCredentialSchema>> {
    try {
      const { tokens } = await this.#client.getToken(authCode);
      return googleCredentialSchema.parse(tokens);
    } catch (error) {
      GoogleService.#handleError(error);
    }
  }

  async verifyIdToken(
    idToken: string
  ): Promise<z.infer<typeof googleTokenPayloadSchema>> {
    try {
      const ticket = await this.#client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      return googleTokenPayloadSchema.parse(payload);
    } catch (error) {
      GoogleService.#handleError(error);
    }
  }
}

export const google = new GoogleService();
