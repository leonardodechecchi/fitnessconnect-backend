import { ForbiddenError } from '@casl/ability';
import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../lib/api-error.js';
import { logger } from '../lib/logger.js';
import { ErrorCode, ResponseHandler } from '../lib/response-handler.js';

export const errorHandler: ErrorRequestHandler = (err, _, res, next): any => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return ResponseHandler.from(res).customError(
      err.code,
      ErrorCode.InternalError,
      err.message
    );
  }

  if (err instanceof ForbiddenError) {
    return ResponseHandler.from(res).forbidden(
      ErrorCode.OperationNotAllowed,
      err.message
    );
  }

  logger.error(err);

  // ! error not handled
  const internalError = ApiError.internalError();
  res.status(internalError.code).json(internalError);
};
