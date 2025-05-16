import { z } from 'zod';
import { paginationSchema } from '../common/common-schemas.js';

export const specialtySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const specialtyArraySchema = z.array(specialtySchema);

export const specialtyIdSchema = z.object({
  specialtyId: z.string().uuid(),
});

export const createSpecialtySchema = z.object({
  name: z.string().trim().min(2).max(50),
});

export const getSpecialtySchema = paginationSchema.extend({
  name: z.string().optional(),
});

export type SpecialtyIdSchema = z.infer<typeof specialtyIdSchema>;
export type CreateSpecialtySchema = z.infer<typeof createSpecialtySchema>;
export type GetSpecialtySchema = z.infer<typeof getSpecialtySchema>;
