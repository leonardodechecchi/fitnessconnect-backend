import { authenticate } from '../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../openapi/smart-router.js';
import { paginationParamSchema } from '../common/common-schemas.js';
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
