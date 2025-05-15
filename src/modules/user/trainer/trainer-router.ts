import { Router } from 'express';
import { authenticateRequest } from '../../../middlewares/authenticate-request.js';
import { validateRequest } from '../../../middlewares/validate-request.js';
import { availabilityRouter } from './availability/availability-router.js';
import { exceptionRouter } from './exception/exception-router.js';
import { getTrainer, getTrainerSlots } from './trainer-controller.js';
import { getTrainerSlotSchema, trainerIdSchema } from './trainer-schemas.js';

export const trainerRouter = Router();

trainerRouter.get(
  '/:trainerId',
  validateRequest({ params: trainerIdSchema }),
  authenticateRequest,
  getTrainer
);

trainerRouter.get(
  '/:trainerId/slots',
  validateRequest({ params: trainerIdSchema, query: getTrainerSlotSchema }),
  authenticateRequest,
  getTrainerSlots
);

trainerRouter.use(
  '/:trainerId/availabilities',
  validateRequest({ params: trainerIdSchema }),
  availabilityRouter
);

trainerRouter.use(
  '/:trainerId/exceptions',
  validateRequest({ params: trainerIdSchema }),
  exceptionRouter
);
