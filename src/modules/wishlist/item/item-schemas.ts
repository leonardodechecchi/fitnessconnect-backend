import { z } from 'zod';

export const itemIdSchema = z.object({
  itemId: z.string().uuid(),
});

export const createItemSchema = z.object({
  trainerId: z.string().uuid(),
});

export type ItemIdSchema = z.infer<typeof itemIdSchema>;
export type CreateItemSchema = z.infer<typeof createItemSchema>;
