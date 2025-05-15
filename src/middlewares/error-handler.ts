import { ForbiddenError } from '@casl/ability';
import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../lib/api-error.js';
import { logger } from '../lib/logger.js';

export const errorHandler: ErrorRequestHandler = (err, _, res, next): any => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.code).json(err);
  }

  if (err instanceof ForbiddenError) {
    const forbiddenError = ApiError.forbidden(err.message);
    return res.status(forbiddenError.code).json(forbiddenError);
  }

  logger.error(err);

  // ! error not handled
  const internalError = ApiError.internalError();
  res.status(internalError.code).json(internalError);
};
