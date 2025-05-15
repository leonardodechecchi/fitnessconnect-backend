import { Router } from 'express';
import { authenticateRequest } from '../../../middlewares/authenticate-request.js';
import { validateRequest } from '../../../middlewares/validate-request.js';
import { answerRouter } from './answer/answer-router.js';
import { createQuestion } from './question-controller.js';
import { questionIdSchema } from './question-schemas.js';

export const questionRouter = Router();

// Invio di una nuova domanda
questionRouter.post('/', authenticateRequest, createQuestion);

questionRouter.use(
  '/:questionId',
  validateRequest({ params: questionIdSchema }),
  answerRouter
);
