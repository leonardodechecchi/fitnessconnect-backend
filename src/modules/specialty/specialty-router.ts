import { authenticate } from '../../middlewares/authenticate-request.js';
import { MagicRouter } from '../../openapi/magic-router.js';
import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
} from './specialty-controller.js';
import {
  createSpecialtySchema,
  getSpecialtySchema,
  specialtyArraySchema,
  specialtyIdSchema,
  specialtySchema,
} from './specialty-schemas.js';

export const SPECIALTY_ROUTER_ROOT = '/specialties';

export const specialtyRouter = new MagicRouter(SPECIALTY_ROUTER_ROOT);

specialtyRouter.get(
  '/',
  {
    requestSchema: { query: getSpecialtySchema },
    responseModel: specialtyArraySchema,
  },
  authenticate,
  getSpecialties
);

specialtyRouter.post(
  '/',
  {
    requestSchema: { body: createSpecialtySchema },
    responseModel: specialtySchema,
  },
  authenticate,
  createSpecialty
);

specialtyRouter.delete(
  '/:specialtyId',
  {
    requestSchema: { params: specialtyIdSchema },
    responseModel: specialtySchema,
  },
  authenticate,
  deleteSpecialty
);
