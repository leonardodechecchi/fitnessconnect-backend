import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { ResponseHandler } from '../lib/response-handler.js';

export const validateRequest = (schemas: {
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  body?: ZodTypeAny;
}): RequestHandler => {
  return async (req, res, next) => {
    Object.entries(schemas).forEach((entry) => {
      const [key, schema] = entry as [keyof typeof schemas, ZodTypeAny];

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const errorString = result.error.toString();
        return ResponseHandler.from(res).badRequest(
          'INVALID_INPUT',
          errorString
        );
      }

      req.body = result.data;
    });

    next();
  };
};
