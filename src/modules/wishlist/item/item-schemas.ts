import type { Ref } from '@mikro-orm/core';
import { z } from 'zod';
import { paginationParamSchema } from '../../common/common-schemas.js';
import type { Trainer } from '../../user/trainer/trainer-entity.js';
import type { Wishlist } from '../wishlist-entity.js';

export interface ItemShape {
  id: string;
  trainer: Ref<Trainer>;
  wishlist: Ref<Wishlist>;
}

export const itemSchema: z.ZodSchema<ItemShape> = z.object({
  id: z.string(),
  trainer: z.custom<Ref<Trainer>>(),
  wishlist: z.custom<Ref<Wishlist>>(),
});

export const itemPaginationParamSchema = paginationParamSchema;

export const itemArraySchema = z.array(itemSchema);

export const itemIdSchema = z.object({
  itemId: z.string().uuid(),
});

export const createItemSchema = z.object({
  trainerId: z.string().uuid(),
});

export type ItemSchema = z.infer<typeof itemSchema>;
export type ItemIdSchema = z.infer<typeof itemIdSchema>;
export type CreateItemSchema = z.infer<typeof createItemSchema>;
export type ItemPaginationParamSchema = z.infer<
  typeof itemPaginationParamSchema
>;
