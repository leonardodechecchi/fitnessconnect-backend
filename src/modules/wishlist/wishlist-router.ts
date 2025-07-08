import { z } from 'zod';
import { authenticate } from '../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../openapi/smart-router.js';
import { paginationParamSchema } from '../common/common-schemas.js';
import { trainerSchema } from '../user/trainer/trainer-schemas.js';
import {
  createWishlistItem,
  deleteWishlistItemById,
  getWishlistItemById,
  getWishlistItems,
} from './item/item-controller.js';
import {
  createItemSchema,
  itemIdSchema,
  itemPaginationParamSchema,
  itemSchema,
} from './item/item-schemas.js';
import {
  createWishlist,
  getWishlistById,
  getWishlists,
} from './wishlist-controller.js';
import {
  createWishlistSchema,
  wishlistArraySchema,
  wishlistIdSchema,
  wishlistSchema,
} from './wishlist-schemas.js';

export const wishlistRouter = new SmartRouter('/wishlists');

wishlistRouter.post(
  '/',
  {
    request: { body: createWishlistSchema },
    response: { schema: wishlistSchema },
  },
  authenticate,
  createWishlist
);

wishlistRouter.get(
  '/',
  {
    request: { query: paginationParamSchema },
    response: {
      schema: wishlistArraySchema,
      options: { enablePagination: true },
    },
  },
  authenticate,
  getWishlists
);

wishlistRouter.get(
  '/:wishlistId',
  {
    request: { params: wishlistIdSchema },
    response: { schema: wishlistSchema },
  },
  authenticate,
  getWishlistById
);

wishlistRouter.patch(
  '/:wishlistId',
  {
    request: { params: wishlistIdSchema },
    response: { schema: wishlistSchema },
  },
  authenticate,
  getWishlistById
);

wishlistRouter.delete(
  '/:wishlistId',
  {
    request: { params: wishlistIdSchema },
    response: { schema: wishlistSchema },
  },
  authenticate,
  getWishlistById
);

wishlistRouter.get(
  '/:wishlistId/items',
  {
    request: { params: wishlistIdSchema, query: itemPaginationParamSchema },
    response: {
      schema: z.array(itemSchema.extend({ trainer: trainerSchema })),
      options: { enablePagination: true },
    },
  },
  authenticate,
  getWishlistItems
);

wishlistRouter.post(
  '/:wishlistId/items',
  {
    request: {
      params: wishlistIdSchema,
      body: createItemSchema,
    },
    response: { schema: itemSchema },
  },
  authenticate,
  createWishlistItem
);

wishlistRouter.get(
  '/:wishlistId/items/:itemId',
  {
    request: { params: wishlistIdSchema.merge(itemIdSchema) },
    response: { schema: itemSchema },
  },
  authenticate,
  getWishlistItemById
);

wishlistRouter.delete(
  '/:wishlistId/items/:itemId',
  {
    request: { params: wishlistIdSchema.merge(itemIdSchema) },
    response: { schema: itemSchema },
  },
  authenticate,
  deleteWishlistItemById
);
