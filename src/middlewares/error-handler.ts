import { ForbiddenError } from '@casl/ability';
import type { ErrorRequestHandler } from 'express';
import { logger } from '../lib/logger.js';
import {
  CustomError,
  ErrorCode,
  ResponseHandler,
} from '../lib/response-handler.js';

export const errorHandler: ErrorRequestHandler = (err, _, res, next): any => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof CustomError) {
    return ResponseHandler.from(res).customError(err);
  }

  if (err instanceof ForbiddenError) {
    return ResponseHandler.from(res).forbidden(
      ErrorCode.FORBIDDEN,
      err.message
    );
  }

  logger.error(err);

  // ! error not handled
  return ResponseHandler.from(res).internal();
};
