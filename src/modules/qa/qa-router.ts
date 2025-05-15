import { Router } from 'express';
import { questionRouter } from './question/question-router.js';

export const qaRouter = Router();

qaRouter.use('/questions', questionRouter);

// Storico domande utente
// questionRouter.get('/users/:userId/questions');

// Storico risposte trainer
// questionRouter.get('/trainers/:trainerId/answers');
