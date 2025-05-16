import { ForbiddenError } from '@casl/ability';
import { wrap } from '@mikro-orm/core';
import { type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiResponse } from '../../lib/api-response.js';
import type { PaginationSchema } from '../common/common-schemas.js';
import {
  type CreateWishlistSchema,
  type PatchWishlistSchema,
  type WishlistIdSchema,
} from './wishlist-schemas.js';

export const getWishlists = async (
  req: Request<unknown, unknown, unknown, PaginationSchema>,
  res: Response
) => {
  const { userId } = req.tokenPayload;
  const { page, limit } = req.query;

  const wishlists = await db.wishlists.find(
    { owner: userId },
    { offset: (page - 1) * limit, limit }
  );

  res.json(ApiResponse.ok(wishlists));
};

export const createWishlist = async (
  req: Request<unknown, unknown, CreateWishlistSchema>,
  res: Response
) => {
  const { name, trainerId } = req.body;
  const { userId } = req.tokenPayload;

  const forbiddenError = ForbiddenError.from(req.ability);

  const trainer = await db.trainers.findOneOrFail(trainerId);
  forbiddenError.throwUnlessCan('read', trainer);

  const wishlist = db.wishlists.create({ name, owner: userId });
  const item = db.items.create({ wishlist, trainer });

  forbiddenError.throwUnlessCan('create', wishlist);
  forbiddenError.throwUnlessCan('create', item);

  await db.em.flush();

  res.json(ApiResponse.created([wishlist, item]));
};

export const getWishlistById = async (
  req: Request<WishlistIdSchema>,
  res: Response
) => {
  const { wishlistId } = req.params;

  const wishlist = await db.wishlists.findOneOrFail(wishlistId);
  ForbiddenError.from(req.ability).throwUnlessCan('read', wishlist);

  res.json(ApiResponse.ok(wishlist));
};

export const patchWishlistById = async (
  req: Request<WishlistIdSchema, unknown, PatchWishlistSchema>,
  res: Response
) => {
  const { wishlistId } = req.params;

  const forbiddenError = ForbiddenError.from(req.ability);

  const wishlist = await db.wishlists.findOneOrFail(wishlistId);

  Object.keys(req.body).forEach((field) =>
    forbiddenError.throwUnlessCan('update', wishlist, field)
  );

  wrap(wishlist).assign(req.body);

  await db.em.flush();

  res.json(ApiResponse.ok(wishlist));
};

export const deleteWishlistById = async (
  req: Request<WishlistIdSchema>,
  res: Response
) => {
  const { wishlistId } = req.params;

  const wishlist = await db.wishlists.findOneOrFail(wishlistId);
  ForbiddenError.from(req.ability).throwUnlessCan('delete', wishlist);

  await db.em.removeAndFlush(wishlist);

  res.json(ApiResponse.ok(wishlist));
};
