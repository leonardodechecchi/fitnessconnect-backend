import axios from 'axios';
import { env } from '../config/env.js';
import { CustomError, ErrorCode } from '../lib/response-handler.js';
import type {
  FacebookAccessTokenResponse,
  FacebookApiErrorResponse,
  FacebookApiUrl,
  FacebookUserPermissionsResponse,
  FacebookUserProfileResponse,
} from '../types/facebook-oauth.js';
import { signStateToken } from '../utils/jwt.js';

export const FACEBOOK_ERRORS = {
  invalid_request: 400,
  unauthorized_client: 401,
  access_denied: 403,
  unsupported_response_type: 400,
  invalid_scope: 400,
  server_error: 500,
  temporarily_unavailable: 503,
  invalid_oauth_access_token: 401,
  permission_error: 403,
  invalid_parameter: 400,
  too_many_calls: 429,
} as const;

class FacebookService {
  #buildURL(url: FacebookApiUrl): string {
    const params = new URLSearchParams(url.params);
    return `${url.path}?${params.toString()}`;
  }

  static #handleError(error: unknown): never {
    if (axios.isAxiosError<FacebookApiErrorResponse>(error)) {
      if (error.response) {
        const fbError = error.response.data.error;
        const code = error.response.status;

        throw new CustomError(
          code,
          ErrorCode.OAUTH_ERROR,
          fbError.error_user_msg || fbError.exception || fbError.message
        );
      }

      if (error.request) {
        throw new CustomError(
          503,
          ErrorCode.SERVICE_UNAVAILABLE,
          'Unable to reach Facebook servers'
        );
      }
    }

    throw new CustomError(
      500,
      ErrorCode.INTERNAL_SERVER,
      'An unexpected error occurred while communicating with Facebook'
    );
  }

  generateAuthUrl(redirectUrl: string): string {
    const state = signStateToken({ redirectUrl });
    return this.#buildURL({
      path: 'https://www.facebook.com/v22.0/dialog/oauth',
      params: {
        client_id: env.FACEBOOK_CLIENT_ID,
        redirect_uri: env.FACEBOOK_REDIRECT_URL,
        scope: 'email,public_profile',
        response_type: 'code,granted_scopes',
        auth_type: 'rerequest',
        state,
      },
    });
  }

  async getAccessToken(code: string): Promise<FacebookAccessTokenResponse> {
    const url = this.#buildURL({
      path: 'https://graph.facebook.com/v22.0/oauth/access_token',
      operationId: 'getAccessToken',
      params: {
        client_id: env.FACEBOOK_CLIENT_ID,
        client_secret: env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: env.FACEBOOK_REDIRECT_URL,
        code,
      },
    });

    try {
      const response = await axios.get<FacebookAccessTokenResponse>(url);
      return response.data;
    } catch (error) {
      FacebookService.#handleError(error);
    }
  }

  async getLongLivedAccessToken(accessToken: string) {
    const url = this.#buildURL({
      path: 'https://graph.facebook.com/v22.0/oauth/access_token',
      operationId: 'getLongLivedAccessToken',
      params: {
        client_id: env.FACEBOOK_CLIENT_ID,
        client_secret: env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: env.FACEBOOK_REDIRECT_URL,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: accessToken,
      },
    });

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      FacebookService.#handleError(err);
    }
  }

  async getUserProfileData(
    accessToken: string
  ): Promise<FacebookUserProfileResponse> {
    const url = this.#buildURL({
      path: 'https://graph.facebook.com/v22.0/me',
      params: {
        access_token: accessToken,
        fields: 'id,email,first_name,last_name,picture',
      },
    });

    try {
      const response = await axios.get<FacebookUserProfileResponse>(url);
      return response.data;
    } catch (err) {
      FacebookService.#handleError(err);
    }
  }

  async getUserPermissions(
    accessToken: string
  ): Promise<FacebookUserPermissionsResponse['data']> {
    const url = this.#buildURL({
      path: 'https://graph.facebook.com/v22.0/me/permissions',
      params: {
        access_token: accessToken,
      },
    });

    try {
      const response = await axios.get<FacebookUserPermissionsResponse>(url);
      return response.data.data;
    } catch (err) {
      FacebookService.#handleError(err);
    }
  }
}

export const facebook = new FacebookService();
