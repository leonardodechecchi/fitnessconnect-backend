import { wrap } from '@mikro-orm/core';
import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiResponse } from '../../lib/api-response.js';
import { ResponseHandler } from '../../lib/response-handler.js';
import type { PaginationParamSchema } from '../common/common-schemas.js';
import {
  type CreateWishlistSchema,
  type WishlistIdSchema,
} from './wishlist-schemas.js';

export const createWishlist = async (
  req: Request<unknown, unknown, CreateWishlistSchema>,
  res: Response
) => {
  const { name, trainerId } = req.body;

  const trainer = await db.trainers.findOneOrFail(trainerId);

  const wishlist = db.wishlists.create({ name, owner: req.userId });
  db.items.create({ wishlist, trainer });

  await db.em.flush();

  res.json(ApiResponse.created(wishlist));
};

export const getWishlists = async (
  req: Request<unknown, unknown, unknown, PaginationParamSchema>,
  res: Response
) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const [wishlists, totalItems] = await db.wishlists.findAndCount(
    { owner: req.userId },
    { offset: (page - 1) * limit, limit }
  );

  return ResponseHandler.from(res).paginated(wishlists, {
    page,
    limit,
    totalItems,
  });
};

export const getWishlistById = async (
  req: Request<WishlistIdSchema>,
  res: Response
) => {
  const wishlist = await db.wishlists.findOneOrFail(req.params.wishlistId);
  return ResponseHandler.from(res).ok(wishlist);
};

export const patchWishlistById = async (
  req: Request<WishlistIdSchema>,
  res: Response
) => {
  const wishlist = await db.wishlists.findOneOrFail(req.params.wishlistId);

  wrap(wishlist).assign(req.body);
  await db.em.flush();

  return ResponseHandler.from(res).ok(wishlist);
};

export const deleteWishlistById = async (
  req: Request<WishlistIdSchema>,
  res: Response
) => {
  const wishlist = await db.wishlists.findOneOrFail(req.params.wishlistId);

  await db.em.removeAndFlush(wishlist);

  return ResponseHandler.from(res).ok(wishlist);
};
