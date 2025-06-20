import { authenticate } from '../../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../../openapi/smart-router.js';
import { paginationParamSchema } from '../../common/common-schemas.js';
import {
  createTrainerAvailability,
  getTrainerAvailabilities,
} from './availability/availability-controller.js';
import {
  availabilitiesSchema,
  availabilitySchema,
  createAvailabilitySchema,
} from './availability/availability-schemas.js';
import {
  createTrainerException,
  getTrainerExceptions,
} from './exception/exception-controller.js';
import {
  createExceptionSchema,
  exceptionsSchema,
} from './exception/exception-schemas.js';
import {
  getTrainerById,
  getTrainers,
  getTrainerSlots,
} from './trainer-controller.js';
import {
  slotArraySchema,
  trainerIdSchema,
  trainerSchema,
  trainerSlotsQueryParams,
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
    request: {
      params: trainerIdSchema,
      query: trainerSlotsQueryParams,
    },
    response: slotArraySchema,
  },
  authenticate,
  getTrainerSlots
);

trainerRouter.get(
  '/:trainerId/availabilities',
  {
    request: { params: trainerIdSchema },
    response: availabilitiesSchema,
  },
  authenticate,
  getTrainerAvailabilities
);

trainerRouter.post(
  '/:trainerId/availabilities',
  {
    request: {
      params: trainerIdSchema,
      body: createAvailabilitySchema,
    },
    response: availabilitySchema,
  },
  authenticate,
  createTrainerAvailability
);

trainerRouter.get(
  '/:trainerId/exceptions',
  {
    request: {
      params: trainerIdSchema,
    },
    response: exceptionsSchema,
  },
  authenticate,
  getTrainerExceptions
);

trainerRouter.post(
  '/:trainerId/exceptions',
  {
    request: {
      params: trainerIdSchema,
      body: createExceptionSchema,
    },
    response: exceptionsSchema,
  },
  authenticate,
  createTrainerException
);
