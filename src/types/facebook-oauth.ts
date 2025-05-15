/**
 * Represents the URL and parameters required to initiate the OAuth dialog
 * for Facebook login. The params include the app's client_id, the
 * redirect_uri to return to after login, the state to maintain state
 * between the request and callback, and an optional auth_type for re-requests.
 */
interface FacebookOAuthDialogUrl {
  path: 'https://www.facebook.com/v22.0/dialog/oauth';
  params: {
    client_id: string;
    redirect_uri: string;
    state: string;
    response_type: string;
    scope: string;
    auth_type?: 'rerequest';
  };
}

/**
 * Represents the URL and parameters required to obtain an app access token
 * from Facebook. The params include the app's client_id, client_secret,
 * and the grant_type, which is fixed as "client_credentials".
 */
interface FacebookAppAccessTokenUrl {
  path: 'https://graph.facebook.com/v22.0/oauth/access_token';
  operationId: 'getAppAccessToken';
  params: {
    client_id: string;
    client_secret: string;
    grant_type: 'client_credentials';
  };
}

/**
 * Represents the URL and parameters required to exchange a short-lived
 * authorization code for a user access token. The params include the app's
 * client_id, client_secret, the redirect_uri used in the login dialog,
 * and the authorization code received from Facebook.
 */
interface FacebookShortLivedUserTokenUrl {
  path: 'https://graph.facebook.com/v22.0/oauth/access_token';
  operationId: 'getAccessToken';
  params: {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    code: string;
  };
}

/**
 * Represents the URL and parameters required to exchange a short-lived user
 * access token for a long-lived access token. The params include the
 * grant_type fixed as "fb_exchange_token", the app's client_id,
 * client_secret, the redirect_uri, and the fb_exchange_token
 * (short-lived token) to be exchanged.
 */
interface FacebookLongLivedUserTokenUrl {
  path: 'https://graph.facebook.com/v22.0/oauth/access_token';
  operationId: 'getLongLivedAccessToken';
  params: {
    grant_type: 'fb_exchange_token';
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    fb_exchange_token: string;
  };
}

/**
 * Represents the URL and parameters required to fetch a user's profile
 * information from Facebook. The params include the access_token to
 * authenticate the request and the fields that specify which user
 * information to retrieve (e.g., name, email).
 */
interface FacebookUserProfileUrl {
  path: 'https://graph.facebook.com/v22.0/me';
  params: {
    access_token: string;
    fields: string;
  };
}

/**
 * Represents the URL and parameters required to fetch a user's permissions
 * from Facebook. The params include the access_token to authenticate the request.
 */
interface FacebookUserPermissionsRequest {
  path: 'https://graph.facebook.com/v22.0/me/permissions';
  params: {
    access_token: string;
  };
}

/**
 * Represents the URL and parameters required to inspect the validity of
 * an access token. The params include the input_token to be inspected
 * and the access_token, which can be an app token or an admin token.
 */
interface FacebookDebugTokenUrl {
  path: 'https://graph.facebook.com/debug_token';
  params: {
    input_token: string;
    access_token: string;
  };
}

export type FacebookApiUrl =
  | FacebookOAuthDialogUrl
  | FacebookAppAccessTokenUrl
  | FacebookShortLivedUserTokenUrl
  | FacebookLongLivedUserTokenUrl
  | FacebookUserProfileUrl
  | FacebookUserPermissionsRequest
  | FacebookDebugTokenUrl;

export type FacebookUserField =
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'picture';

export type FacebookUserPermission = 'email' | 'public_profile';

export interface FacebookApiErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_code: number;
    exception?: string;
    error_subcode?: number;
    error_user_msg?: string;
    error_user_title?: string;
    fbtrace_id?: string;
  };
}

export interface FacebookAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FacebookUserPermissionsResponse {
  data: {
    permission: FacebookUserPermission;
    status: 'granted' | 'denied';
  }[];
}

export interface FacebookUserProfileResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  picture: {
    data: {
      is_silhouette: boolean;
      height: number;
      width: number;
      url: string;
    };
  };
}
