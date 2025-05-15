import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { fromError } from 'zod-validation-error';
import { ApiError } from '../lib/api-error.js';

export const validateRequest = (schemas: {
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  body?: ZodTypeAny;
}): RequestHandler => {
  return async (req, _, next) => {
    Object.entries(schemas).forEach((entry) => {
      const [key, schema] = entry as [keyof typeof schemas, ZodTypeAny];

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const error = fromError(result.error);
        throw ApiError.badRequest(error.toString());
      }

      Object.keys(schemas).forEach((key) => {
        if (key === 'body') {
          req[key] = result.data;
        }
      });
    });

    next();
  };
};
