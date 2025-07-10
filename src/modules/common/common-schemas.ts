import { z } from 'zod';
import { ErrorCode } from '../../lib/response-handler.js';

export const paginationParamSchema = z.object({
  page: z
    .preprocess((page) => Number(page), z.number())
    .openapi({ example: 1 }),
  limit: z
    .preprocess((limit) => Number(limit), z.number())
    .openapi({ example: 10 }),
});

export const successResponseSchema = z.object({
  message: z.string().optional(),
  // data: z.unknown(),
  timestamp: z.string(),
});

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export const successPaginatedResponseSchema = successResponseSchema.extend({
  // data: z.array(z.unknown()),
  pagination: paginationSchema,
});

export const errorResponseSchema = z
  .object({
    code: z.nativeEnum(ErrorCode),
    message: z.string(),
    details: z.unknown().optional(),
    timestamp: z.string(),
  })
  .openapi('ErrorResponseSchema');

export type PaginationParamSchema = z.infer<typeof paginationParamSchema>;
export type PaginationSchema = z.infer<typeof paginationSchema>;

export type SuccessResponseSchema<T> = { data: T } & z.infer<
  typeof successResponseSchema
>;

export type SuccessResponseNoDataSchema = Omit<
  z.infer<typeof successResponseSchema>,
  'data'
>;

export type SuccessPaginatedResponseSchema<T> = {
  data: T[];
} & z.infer<typeof successPaginatedResponseSchema>;

export type ErrorResponseSchema = z.infer<typeof errorResponseSchema>;
