import { z } from 'zod';

export const wishlistIdSchema = z.object({
  wishlistId: z.string().uuid(),
});

export const createWishlistSchema = z.object({
  name: z.string().trim().min(2).max(50),
  trainerId: z.string().uuid(),
});

export const patchWishlistSchema = z
  .object({
    name: z.string().trim().min(2).max(50),
  })
  .partial();

export type WishlistIdSchema = z.infer<typeof wishlistIdSchema>;
export type CreateWishlistSchema = z.infer<typeof createWishlistSchema>;
export type PatchWishlistSchema = z.infer<typeof patchWishlistSchema>;
