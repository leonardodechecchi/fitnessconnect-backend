import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { ErrorCode, ResponseHandler } from '../lib/response-handler.js';

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
          ErrorCode.INVALID_INPUT,
          errorString
        );
      }

      console.log(result.data);

      req.body = result.data;
    });

    next();
  };
};
