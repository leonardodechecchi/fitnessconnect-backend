import { authenticate } from '../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../openapi/smart-router.js';
import { paginationParamSchema } from '../common/common-schemas.js';
import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
} from './specialty-controller.js';
import {
  createSpecialtySchema,
  specialtiesSchema,
  specialtyIdSchema,
  specialtySchema,
} from './specialty-schemas.js';

export const specialtyRouter = new SmartRouter('/specialties');

specialtyRouter.get(
  '/',
  {
    request: { query: paginationParamSchema },
    response: specialtiesSchema,
  },
  authenticate,
  getSpecialties
);

specialtyRouter.post(
  '/',
  {
    request: { body: createSpecialtySchema },
    response: specialtySchema,
  },
  authenticate,
  createSpecialty
);

specialtyRouter.delete(
  '/:specialtyId',
  {
    request: { params: specialtyIdSchema },
    response: specialtySchema,
  },
  authenticate,
  deleteSpecialty
);
