import { Router } from 'express';
import { authenticateRequest } from '../../middlewares/authenticate-request.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
} from './specialty-controller.js';
import {
  createSpecialtySchema,
  specialtyIdSchema,
} from './specialty-schemas.js';

export const specialtyRouter = Router();

specialtyRouter.get('/', authenticateRequest, getSpecialties);

specialtyRouter.post(
  '/',
  validateRequest({ body: createSpecialtySchema }),
  authenticateRequest,
  createSpecialty
);

specialtyRouter.delete(
  '/:specialtyId',
  validateRequest({ params: specialtyIdSchema }),
  authenticateRequest,
  deleteSpecialty
);
