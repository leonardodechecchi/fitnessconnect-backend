import { z } from 'zod';

export const specialtyIdSchema = z.object({
  specialtyId: z.string().uuid(),
});

export const createSpecialtySchema = z.object({
  name: z.string().trim().min(2).max(50),
});

export type SpecialtyIdSchema = z.infer<typeof specialtyIdSchema>;
export type CreateSpecialtySchema = z.infer<typeof createSpecialtySchema>;
