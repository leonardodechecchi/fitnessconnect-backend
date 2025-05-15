import type { RequestHandler } from 'express';

import { db } from '../../../../database/database-client.js';
import { ApiError } from '../../../../lib/api-error.js';
import { ApiResponse } from '../../../../lib/api-response.js';
import type { QuestionIdSchema } from '../question-schemas.js';
import type { CreateAnswerSchema } from './answer-schemas.js';

export const createAnswer: RequestHandler<
  QuestionIdSchema,
  unknown,
  CreateAnswerSchema
> = async (req, res) => {
  const { questionId } = req.params;
  const { content, trainerId } = req.body;

  const [question, trainer, count] = await Promise.all([
    db.questions.findOneOrFail(questionId),
    db.trainers.findOneOrFail(trainerId),
    db.answers.count({ question: questionId, trainer: trainerId }),
  ]);

  if (count > 0) {
    throw ApiError.conflict('You cannot reply to this question more than once');
  }

  req.forbidden.throwUnlessCan('read', question);
  req.forbidden.throwUnlessCan('read', trainer);

  const answer = db.answers.create({ content, trainer, question });

  req.forbidden.throwUnlessCan('create', answer);

  await db.em.flush();

  const response = ApiResponse.created(answer);
  res.status(response.code).json(response);
};
