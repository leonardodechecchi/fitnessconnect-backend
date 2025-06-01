import type { ZodTypeAny } from 'zod';
import {
  successPaginatedResponseSchema,
  successResponseSchema,
} from './common-schemas.js';

export const defineSuccessResponse = <T extends ZodTypeAny>(schema?: T) => {
  return schema
    ? successResponseSchema.extend({ data: schema })
    : successResponseSchema;
};

export const defineSuccessPaginatedResponse = <T extends ZodTypeAny>(
  schema: T
) => {
  return successPaginatedResponseSchema.extend({ data: schema });
};
