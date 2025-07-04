import { z } from 'zod';
import { authenticate } from '../../../middlewares/authenticate-request.js';
import { SmartRouter } from '../../../openapi/smart-router.js';
import { specialtyArraySchema } from '../../specialty/specialty-schemas.js';
import {
  createTrainerAvailability,
  getTrainerAvailabilities,
} from './availability/availability-controller.js';
import {
  availabilityArraySchema,
  availabilitySchema,
  createAvailabilitySchema,
} from './availability/availability-schemas.js';
import {
  createTrainerException,
  getTrainerExceptions,
} from './exception/exception-controller.js';
import {
  createExceptionSchema,
  exceptionArraySchema,
  exceptionSchema,
} from './exception/exception-schemas.js';
import {
  getTrainerById,
  getTrainers,
  getTrainerSlots,
} from './trainer-controller.js';
import {
  slotArraySchema,
  trainerIdSchema,
  trainerPaginationParamSchema,
  trainerSchema,
  trainerSlotsQueryParams,
} from './trainer-schemas.js';

export const trainerRouter = new SmartRouter('/trainers');

trainerRouter.get(
  '/',
  {
    request: { query: trainerPaginationParamSchema },
    response: {
      schema: z.array(
        trainerSchema.extend({ specialties: specialtyArraySchema })
      ),
      options: { enablePagination: true },
    },
  },
  authenticate,
  getTrainers
);

trainerRouter.get(
  '/:trainerId',
  {
    request: { params: trainerIdSchema },
    response: {
      schema: trainerSchema.extend({ specialties: specialtyArraySchema }),
    },
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
    response: { schema: slotArraySchema },
  },
  authenticate,
  getTrainerSlots
);

trainerRouter.get(
  '/:trainerId/availabilities',
  {
    request: { params: trainerIdSchema },
    response: { schema: availabilityArraySchema },
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
    response: { schema: availabilitySchema },
  },
  authenticate,
  createTrainerAvailability
);

trainerRouter.get(
  '/:trainerId/exceptions',
  {
    request: { params: trainerIdSchema },
    response: { schema: exceptionArraySchema },
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
    response: { schema: exceptionSchema },
  },
  authenticate,
  createTrainerException
);
