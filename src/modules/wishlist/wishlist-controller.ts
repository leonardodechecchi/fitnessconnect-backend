import { ForbiddenError } from '@casl/ability';
import { wrap } from '@mikro-orm/core';
import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
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
  ForbiddenError.from(req.ability).throwUnlessCan('read', trainer);

  const wishlist = db.wishlists.create({ name, owner: req.userId });
  ForbiddenError.from(req.ability).throwUnlessCan('create', wishlist);

  db.items.create({ wishlist, trainer });

  await db.em.flush();

  return ResponseHandler.from(res).created(wishlist);
};

export const getWishlists = async (
  req: Request<unknown, unknown, unknown, PaginationParamSchema>,
  res: Response
) => {
  const { page, limit } = req.query;

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
  ForbiddenError.from(req.ability).throwUnlessCan('read', wishlist);

  return ResponseHandler.from(res).ok(wishlist);
};

export const patchWishlistById = async (
  req: Request<WishlistIdSchema>,
  res: Response
) => {
  const wishlist = await db.wishlists.findOneOrFail(req.params.wishlistId);
  ForbiddenError.from(req.ability).throwUnlessCan('update', wishlist);

  wrap(wishlist).assign(req.body);
  await db.em.flush();

  return ResponseHandler.from(res).ok(wishlist);
};

export const deleteWishlistById = async (
  req: Request<WishlistIdSchema>,
  res: Response
) => {
  const wishlist = await db.wishlists.findOneOrFail(req.params.wishlistId);
  ForbiddenError.from(req.ability).throwUnlessCan('delete', wishlist);

  await db.em.removeAndFlush(wishlist);

  return ResponseHandler.from(res).ok(wishlist);
};
