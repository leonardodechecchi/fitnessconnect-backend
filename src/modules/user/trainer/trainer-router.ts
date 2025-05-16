import { authenticate } from '../../../middlewares/authenticate-request.js';
import { MagicRouter } from '../../../openapi/magic-router.js';
import { getTrainerById, getTrainerSlots } from './trainer-controller.js';
import {
  getTrainerSlotSchema,
  slotArraySchema,
  trainerIdSchema,
} from './trainer-schemas.js';

export const TRAINER_ROUTER_ROOT = '/trainers';

export const trainerRouter = new MagicRouter(TRAINER_ROUTER_ROOT);

trainerRouter.get(
  '/:trainerId',
  { requestSchema: { params: trainerIdSchema } },
  authenticate,
  getTrainerById
);

trainerRouter.get(
  '/:trainerId/slots',
  {
    requestSchema: { params: trainerIdSchema, query: getTrainerSlotSchema },
    responseModel: slotArraySchema,
  },
  authenticate,
  getTrainerSlots
);

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
