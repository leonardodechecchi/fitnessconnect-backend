import { ForbiddenError } from '@casl/ability';
import { Router, type Request, type Response } from 'express';
import { db } from '../../../database/database-client.js';
import { ApiResponse } from '../../../lib/api-response.js';
import { authenticateRequest } from '../../../middlewares/authenticate-request.js';
import { validateRequest } from '../../../middlewares/validate-request.js';
import type { WishlistIdSchema } from '../wishlist-schemas.js';
import {
  createItemSchema,
  itemIdSchema,
  type CreateItemSchema,
  type ItemIdSchema,
} from './item-schemas.js';

export const itemRouter = Router({ mergeParams: true });

itemRouter.post(
  '/',
  validateRequest({ body: createItemSchema }),
  authenticateRequest,
  async (
    req: Request<WishlistIdSchema, unknown, CreateItemSchema>,
    res: Response
  ) => {
    const { wishlistId } = req.params;

    const wishlist = await db.wishlists.findOneOrFail(wishlistId);

    ForbiddenError.from(req.ability).throwUnlessCan('update', wishlist);

    const trainer = await db.trainers.findOneOrFail(req.body.trainerId);

    ForbiddenError.from(req.ability).throwUnlessCan('read', trainer);

    const item = db.items.create({
      wishlist,
      trainer,
    });

    await db.em.flush();

    res.json(ApiResponse.created(item));
  }
);

itemRouter.get(
  '/:itemId',
  validateRequest({ params: itemIdSchema }),
  authenticateRequest,
  async (req: Request<WishlistIdSchema & ItemIdSchema>, res: Response) => {
    const { wishlistId, itemId } = req.params;

    const wishlist = await db.wishlists.findOneOrFail(wishlistId);

    ForbiddenError.from(req.ability).throwUnlessCan('read', wishlist);

    const item = await db.items.findOneOrFail({
      wishlist: wishlistId, // ? this way we know the item is part of the user wishlist
      id: itemId,
    });

    res.json(ApiResponse.created(item));
  }
);

itemRouter.delete(
  '/:itemId',
  validateRequest({ params: itemIdSchema }),
  authenticateRequest,
  async (req: Request<WishlistIdSchema & ItemIdSchema>, res: Response) => {
    const { wishlistId, itemId } = req.params;

    const wishlist = await db.wishlists.findOneOrFail(wishlistId);

    ForbiddenError.from(req.ability).throwUnlessCan('update', wishlist);

    const item = await db.items.findOneOrFail({
      wishlist: wishlistId,
      id: itemId,
    });

    await db.em.removeAndFlush(item);

    res.json(ApiResponse.noContent());
  }
);
