import { Router } from 'express';
import { authenticateRequest } from '../../../../middlewares/authenticate-request.js';
import { validateRequest } from '../../../../middlewares/validate-request.js';
import {
  createAvailability,
  getAvailabilities,
} from './availability-controller.js';
import { createAvailabilitySchema } from './availability-schemas.js';

export const availabilityRouter = Router({ mergeParams: true });

availabilityRouter.get('/', authenticateRequest, getAvailabilities);

availabilityRouter.post(
  '/',
  validateRequest({ body: createAvailabilitySchema }),
  authenticateRequest,
  createAvailability
);
