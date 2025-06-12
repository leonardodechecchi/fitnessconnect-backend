import { Router } from 'express';
import { validateRequest } from '../../../../middlewares/validate-request.js';
import { createException, getExceptions } from './exception-controller.js';
import { createExceptionSchema } from './exception-schemas.js';

export const exceptionRouter = Router({ mergeParams: true });

exceptionRouter.get('/', getExceptions);

exceptionRouter.post(
  '/',
  validateRequest({ body: createExceptionSchema }),
  createException
);
