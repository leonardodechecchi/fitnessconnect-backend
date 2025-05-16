import { z } from 'zod';

export const idSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.string().transform(Number).openapi({ example: '1' }),
  limit: z.string().transform(Number).openapi({ example: '10' }),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
