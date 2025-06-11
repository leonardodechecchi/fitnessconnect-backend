import { authenticate } from '../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../openapi/smart-router.js';
import { paginationParamSchema } from '../common/common-schemas.js';
import {
  createWishlistItem,
  deleteWishlistItemById,
  getWishlistItemById,
  getWishlistItems,
} from './item/item-controller.js';
import { createItemSchema, itemIdSchema } from './item/item-schemas.js';
import {
  createWishlist,
  getWishlistById,
  getWishlists,
} from './wishlist-controller.js';
import {
  createWishlistSchema,
  wishlistIdSchema,
  wishlistSchema,
  wishlistsSchema,
} from './wishlist-schemas.js';

export const wishlistRouter = new SmartRouter('/wishlists');

wishlistRouter.post(
  '/',
  {
    request: { body: createWishlistSchema },
    response: wishlistSchema,
  },
  authenticate,
  createWishlist
);

wishlistRouter.get(
  '/',
  {
    request: { query: paginationParamSchema },
    response: wishlistsSchema,
  },
  authenticate,
  getWishlists
);

wishlistRouter.get(
  '/:wishlistId',
  {
    request: { params: wishlistIdSchema },
    response: wishlistSchema,
  },
  authenticate,
  getWishlistById
);

wishlistRouter.patch(
  '/:wishlistId',
  {
    request: { params: wishlistIdSchema },
    response: wishlistSchema,
  },
  authenticate,
  getWishlistById
);

wishlistRouter.delete(
  '/:wishlistId',
  {
    request: { params: wishlistIdSchema },
    response: wishlistSchema,
  },
  authenticate,
  getWishlistById
);

wishlistRouter.post(
  '/:wishlistId/items',
  {
    request: {
      params: wishlistIdSchema,
      body: createItemSchema,
    },
  },
  authenticate,
  createWishlistItem
);

wishlistRouter.get(
  '/:wishlistId/items',
  {
    request: { params: wishlistIdSchema },
  },
  authenticate,
  getWishlistItems
);

wishlistRouter.get(
  '/:wishlistId/items/:itemId',
  {
    request: { params: wishlistIdSchema.merge(itemIdSchema) },
  },
  authenticate,
  getWishlistItemById
);

wishlistRouter.delete(
  '/:wishlistId/items/:itemId',
  {
    request: { params: wishlistIdSchema.merge(itemIdSchema) },
  },
  authenticate,
  deleteWishlistItemById
);
