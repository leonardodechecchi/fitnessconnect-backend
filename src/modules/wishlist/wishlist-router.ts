import { authenticate } from '../../middlewares/authenticate-request.js';
import { MagicRouter } from '../../openapi/magic-router.js';
import {
  createWishlistItem,
  getWishlistItemById,
} from './item/item-controller.js';
import { createItemSchema, itemIdSchema } from './item/item-schemas.js';
import {
  createWishlist,
  deleteWishlistById,
  getWishlistById,
  patchWishlistById,
} from './wishlist-controller.js';
import {
  createWishlistSchema,
  patchWishlistSchema,
  wishlistIdSchema,
} from './wishlist-schemas.js';

export const WISHLIST_ROUTER_ROOT = '/wishlists';

export const wishlistRouter = new MagicRouter(WISHLIST_ROUTER_ROOT);

wishlistRouter.post(
  '/',
  { requestSchema: { body: createWishlistSchema } },
  authenticate,
  createWishlist
);

wishlistRouter.get(
  '/:wishlistId',
  { requestSchema: { params: wishlistIdSchema } },
  authenticate,
  getWishlistById
);

wishlistRouter.patch(
  '/:wishlistId',
  { requestSchema: { params: wishlistIdSchema, body: patchWishlistSchema } },
  authenticate,
  patchWishlistById
);

wishlistRouter.delete(
  '/:wishlistId',
  { requestSchema: { params: wishlistIdSchema } },
  authenticate,
  deleteWishlistById
);

wishlistRouter.post(
  '/:wishlistId/items',
  { requestSchema: { params: wishlistIdSchema, body: createItemSchema } },
  createWishlistItem
);

wishlistRouter.get(
  '/:wishlistId/items/:itemId',
  { requestSchema: { params: wishlistIdSchema.merge(itemIdSchema) } },
  getWishlistItemById
);
