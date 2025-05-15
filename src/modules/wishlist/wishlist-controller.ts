import { ForbiddenError } from '@casl/ability';
import { wrap } from '@mikro-orm/core';
import { Router, type Request, type Response } from 'express';
import { db } from '../../database/database-client.js';
import { ApiResponse } from '../../lib/api-response.js';
import { authenticateRequest } from '../../middlewares/authenticate-request.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { itemRouter } from './item/item-controller.js';
import {
  createWishlistSchema,
  patchWishlistSchema,
  wishlistIdSchema,
  type CreateWishlistSchema,
  type PatchWishlistSchema,
  type WishlistIdSchema,
} from './wishlist-schemas.js';

export const wishlistRouter = Router();

wishlistRouter.post(
  '/',
  validateRequest({ body: createWishlistSchema }),
  authenticateRequest,
  async (
    req: Request<unknown, unknown, CreateWishlistSchema>,
    res: Response
  ) => {
    const { name, trainerId } = req.body;

    const trainer = await db.trainers.findOneOrFail(trainerId);

    ForbiddenError.from(req.ability).throwUnlessCan('read', trainer);

    const wishlist = db.wishlists.create({ name, owner: req.userId });
    db.items.create({ wishlist, trainer });

    ForbiddenError.from(req.ability).throwUnlessCan('create', wishlist);

    await db.em.flush();

    res.json(ApiResponse.created(wishlist));
  }
);

// TODO: implementation
wishlistRouter.get(
  '/',
  authenticateRequest,
  async (req: Request, res: Response) => {
    throw new Error('Method not implemented yet');
  }
);

wishlistRouter.get(
  '/:wishlistId',
  validateRequest({ params: wishlistIdSchema }),
  authenticateRequest,
  async (req: Request<WishlistIdSchema>, res: Response) => {
    const { wishlistId } = req.params;

    const wishlist = await db.wishlists.findOneOrFail(wishlistId);

    ForbiddenError.from(req.ability).throwUnlessCan('read', wishlist);

    res.json(ApiResponse.ok(wishlist));
  }
);

wishlistRouter.patch(
  '/:wishlistId',
  validateRequest({ params: wishlistIdSchema, body: patchWishlistSchema }),
  authenticateRequest,
  async (
    req: Request<WishlistIdSchema, unknown, PatchWishlistSchema>,
    res: Response
  ) => {
    const { wishlistId } = req.params;

    const wishlist = await db.wishlists.findOneOrFail(wishlistId);

    Object.keys(req.body).forEach((field) =>
      ForbiddenError.from(req.ability).throwUnlessCan('update', wishlist, field)
    );

    wrap(wishlist).assign(req.body);

    await db.em.flush();

    res.json(ApiResponse.ok(wishlist));
  }
);

wishlistRouter.delete(
  '/:wishlistId',
  validateRequest({ params: wishlistIdSchema }),
  authenticateRequest,
  async (req: Request<WishlistIdSchema>, res: Response) => {
    const { wishlistId } = req.params;

    const wishlist = await db.wishlists.findOneOrFail(wishlistId);

    ForbiddenError.from(req.ability).throwUnlessCan('delete', wishlist);

    await db.em.removeAndFlush(wishlist);

    res.json(ApiResponse.ok(wishlist));
  }
);

wishlistRouter.use(
  '/:wishlistId/items',
  validateRequest({ params: wishlistIdSchema }),
  itemRouter
);
