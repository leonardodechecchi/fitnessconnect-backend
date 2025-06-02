import { authenticate } from '../../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../../openapi/smart-router.js';
import { paginationParamSchema } from '../../common/common-schemas.js';
import {
  getTrainerById,
  getTrainers,
  getTrainerSlots,
} from './trainer-controller.js';
import {
  trainerIdSchema,
  trainerSchema,
  trainersSchema,
} from './trainer-schemas.js';

export const trainerRouter = new SmartRouter('/trainers');

trainerRouter.get(
  '/',
  {
    request: { query: paginationParamSchema },
    response: trainersSchema,
  },
  authenticate,
  getTrainers
);

trainerRouter.get(
  '/:trainerId',
  {
    request: { params: trainerIdSchema },
    response: trainerSchema,
  },
  authenticate,
  getTrainerById
);

trainerRouter.get(
  '/:trainerId/slots',
  {
    request: { params: trainerIdSchema },
  },
  authenticate,
  getTrainerSlots
);

// trainerRouter.get(
//   '/:trainerId/slots',
//   validateRequest({ params: trainerIdSchema, query: getTrainerSlotSchema }),
//   authenticateRequest,
//   getTrainerSlots
// );

// trainerRouter.use(
//   '/:trainerId/availabilities',
//   validateRequest({ params: trainerIdSchema }),
//   availabilityRouter
// );

// trainerRouter.use(
//   '/:trainerId/exceptions',
//   validateRequest({ params: trainerIdSchema }),
//   exceptionRouter
// );
