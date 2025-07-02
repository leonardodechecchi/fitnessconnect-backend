import { HttpStatusCode } from 'axios';
import type { Response } from 'express';
import type { ResponseExtended } from '../middlewares/validare-response.js';
import type {
  ErrorResponseSchema,
  PaginationSchema,
  SuccessPaginatedResponseSchema,
  SuccessResponseNoDataSchema,
  SuccessResponseSchema,
} from '../modules/common/common-schemas.js';

export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_INPUT = 'INVALID_INPUT',
  OAUTH_ERROR = 'OAUTH_ERROR',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
}

export class CustomError extends Error {
  readonly statusCode: number;
  readonly errorCode: ErrorCode;
  readonly details?: unknown[];

  constructor(
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
    details?: unknown[]
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ResponseHandler {
  #response: Response | ResponseExtended;

  private constructor(response: Response | ResponseExtended) {
    this.#response = response;
  }

  static from(response: Response) {
    return new ResponseHandler(response);
  }

  private sendError(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: unknown
  ) {
    const payload: ErrorResponseSchema = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(statusCode).json(payload);
  }

  customError(error: CustomError) {
    const { statusCode, errorCode, message, details } = error;
    return this.sendError(statusCode, errorCode, message, details);
  }

  noData(message: string = 'OK') {
    const payload: SuccessResponseNoDataSchema = {
      message,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Ok).json(payload);
  }

  ok<T>(data: T, message: string = 'OK') {
    const payload: SuccessResponseSchema<T> = {
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return 'jsonValidate' in this.#response
      ? this.#response.status(HttpStatusCode.Ok).jsonValidate(payload)
      : this.#response.status(HttpStatusCode.Ok).json(payload);
  }

  paginated<T>(
    data: T[],
    pagination: Omit<PaginationSchema, 'totalPages'>,
    message: string = 'OK'
  ) {
    const { page, limit, totalItems } = pagination;

    const totalPages = Math.ceil(totalItems / limit);

    const payload: SuccessPaginatedResponseSchema<T> = {
      message,
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Ok).json(payload);
  }

  created<T>(data: T, message: string = 'Created') {
    const payload: SuccessResponseSchema<T> = {
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Created).json(payload);
  }

  unauthorized(
    code: ErrorCode,
    message: string = 'Unauthorized',
    details?: unknown
  ) {
    return this.sendError(401, code, message, details);
  }

  forbidden(code: ErrorCode, message: string = 'Forbidden', details?: unknown) {
    return this.sendError(403, code, message, details);
  }

  notFound(code: ErrorCode, message: string = 'Not found', details?: unknown) {
    return this.sendError(404, code, message, details);
  }

  badRequest(
    code: ErrorCode,
    message: string = 'Bad request',
    details?: unknown
  ) {
    return this.sendError(400, code, message, details);
  }

  conflict(code: ErrorCode, message: string = 'Conflict', details?: unknown) {
    return this.sendError(409, code, message, details);
  }

  internal(message: string = 'Internal Server Error') {
    return this.sendError(500, ErrorCode.INTERNAL_SERVER, message);
  }
}
