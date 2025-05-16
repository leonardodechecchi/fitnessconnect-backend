import { authenticate } from '../../middlewares/authenticate-request.js';
import { MagicRouter } from '../../openapi/magic-router.js';
import { paginationSchema } from '../common/common-schemas.js';
import {
  createWishlistItem,
  deleteWishlistItemById,
  getWishlistItemById,
  getWishlistItems,
} from './item/item-controller.js';
import { createItemSchema, itemIdSchema } from './item/item-schemas.js';
import {
  createWishlist,
  deleteWishlistById,
  getWishlistById,
  getWishlists,
  patchWishlistById,
} from './wishlist-controller.js';
import {
  createWishlistSchema,
  patchWishlistSchema,
  wishlistIdSchema,
} from './wishlist-schemas.js';

export const WISHLIST_ROUTER_ROOT = '/wishlists';

export const wishlistRouter = new MagicRouter(WISHLIST_ROUTER_ROOT);

wishlistRouter.get(
  '/',
  { requestSchema: { query: paginationSchema } },
  authenticate,
  getWishlists
);

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

wishlistRouter.get(
  '/:wishlistId/items',
  { requestSchema: { params: wishlistIdSchema, query: paginationSchema } },
  authenticate,
  getWishlistItems
);

wishlistRouter.post(
  '/:wishlistId/items',
  { requestSchema: { params: wishlistIdSchema, body: createItemSchema } },
  authenticate,
  createWishlistItem
);

wishlistRouter.get(
  '/:wishlistId/items/:itemId',
  { requestSchema: { params: wishlistIdSchema.merge(itemIdSchema) } },
  authenticate,
  getWishlistItemById
);

wishlistRouter.delete(
  '/:wishlistId/items/:itemId',
  { requestSchema: { params: wishlistIdSchema.merge(itemIdSchema) } },
  authenticate,
  deleteWishlistItemById
);
