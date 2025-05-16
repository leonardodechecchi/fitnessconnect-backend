import { ForbiddenError } from '@casl/ability';
import { type Request, type Response } from 'express';
import { db } from '../../../database/database-client.js';
import { ApiResponse } from '../../../lib/api-response.js';
import type { WishlistIdSchema } from '../wishlist-schemas.js';
import { type CreateItemSchema, type ItemIdSchema } from './item-schemas.js';

// TODO: check CASL permissions
export const createWishlistItem = async (
  req: Request<WishlistIdSchema, unknown, CreateItemSchema>,
  res: Response
) => {
  const { wishlistId } = req.params;

  const forbiddenError = ForbiddenError.from(req.ability);

  const wishlist = await db.wishlists.findOneOrFail(wishlistId);
  forbiddenError.throwUnlessCan('update', wishlist);

  const trainer = await db.trainers.findOneOrFail(req.body.trainerId);
  forbiddenError.throwUnlessCan('read', trainer);

  const item = db.items.create({ wishlist, trainer });

  await db.em.flush();

  res.json(ApiResponse.created(item, 'Item created successfully'));
};

export const getWishlistItemById = async (
  req: Request<WishlistIdSchema & ItemIdSchema>,
  res: Response
) => {
  const { wishlistId, itemId } = req.params;

  const wishlist = await db.wishlists.findOneOrFail(wishlistId);
  ForbiddenError.from(req.ability).throwUnlessCan('read', wishlist);

  const item = await db.items.findOneOrFail({
    wishlist: wishlistId,
    id: itemId,
  });

  res.json(ApiResponse.ok(item));
};

export const deleteWishlistItemById = async (
  req: Request<WishlistIdSchema & ItemIdSchema>,
  res: Response
) => {
  const { wishlistId, itemId } = req.params;

  const wishlist = await db.wishlists.findOneOrFail(wishlistId);
  ForbiddenError.from(req.ability).throwUnlessCan('update', wishlist);

  const item = await db.items.findOneOrFail({
    wishlist: wishlistId,
    id: itemId,
  });

  await db.em.removeAndFlush(item);

  res.json(ApiResponse.ok(item, 'Item deleted successfully'));
};
