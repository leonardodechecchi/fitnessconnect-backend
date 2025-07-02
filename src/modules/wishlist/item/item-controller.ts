import { ForbiddenError } from '@casl/ability';
import { type Request, type Response } from 'express';
import { db } from '../../../database/database-client.js';
import { ResponseHandler } from '../../../lib/response-handler.js';
import type { PaginationParamSchema } from '../../common/common-schemas.js';
import type { WishlistIdSchema } from '../wishlist-schemas.js';
import { type ItemIdSchema } from './item-schemas.js';

export const getWishlistItems = async (
  req: Request<WishlistIdSchema, unknown, unknown, PaginationParamSchema>,
  res: Response
) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const [items, totalItems] = await db.items.findAndCount(
    { wishlist: req.params.wishlistId },
    {
      offset: (page - 1) * limit,
      limit,
    }
  );

  return ResponseHandler.from(res).paginated(items, {
    page,
    limit,
    totalItems,
  });
};

export const createWishlistItem = async (
  req: Request<WishlistIdSchema>,
  res: Response
) => {
  const wishlist = await db.wishlists.findOneOrFail(req.params.wishlistId);
  ForbiddenError.from(req.ability).throwUnlessCan('update', wishlist);

  const trainer = await db.trainers.findOneOrFail(req.body.trainerId);
  ForbiddenError.from(req.ability).throwUnlessCan('read', trainer);

  const item = db.items.create({
    wishlist,
    trainer,
  });

  await db.em.flush();

  return ResponseHandler.from(res).created(item);
};

export const getWishlistItemById = async (
  req: Request<WishlistIdSchema & ItemIdSchema>,
  res: Response
) => {
  const { wishlistId, itemId } = req.params;

  const wishlist = await db.wishlists.findOneOrFail(wishlistId);
  ForbiddenError.from(req.ability).throwUnlessCan('read', wishlist);

  const item = await db.items.findOneOrFail({
    wishlist: wishlistId, // ? this way we know the item is part of the user wishlist
    id: itemId,
  });

  return ResponseHandler.from(res).created(item);
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

  return ResponseHandler.from(res).ok(item);
};
