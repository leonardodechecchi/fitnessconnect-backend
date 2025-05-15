import type { RequestHandler } from 'express';
import { fromError } from 'zod-validation-error';
import { ApiError } from '../lib/api-error.js';
import type { RequestSchema } from '../openapi/magic-router.js';
import type { ZodObjectWithEffect } from '../types/zod.js';

export const validateRequest = (schemas: RequestSchema): RequestHandler => {
  return async (req, _, next) => {
    Object.entries(schemas).forEach((entry) => {
      const [key, schema] = entry as [
        keyof typeof schemas,
        ZodObjectWithEffect
      ];

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
