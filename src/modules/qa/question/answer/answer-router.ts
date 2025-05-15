import { Router } from 'express';
import { authenticateRequest } from '../../../../middlewares/authenticate-request.js';
import { validateRequest } from '../../../../middlewares/validate-request.js';
import { createAnswer } from './answer-controller.js';
import { createAnswerSchema } from './answer-schemas.js';

export const answerRouter = Router({ mergeParams: true });

answerRouter.post(
  '/',
  validateRequest({ body: createAnswerSchema }),
  authenticateRequest,
  createAnswer
);
